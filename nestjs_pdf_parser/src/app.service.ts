// src/app.service.ts
import { Injectable } from '@nestjs/common';
import { PDFExtract, PDFExtractText } from 'pdf.js-extract';
import { PdfParseBomInterface } from './interfaces/pdf-parse-bom.interface';
import { PdfParsingType } from './types/pdf-parsing.type';
import { Row } from './interfaces/row.interface';

@Injectable()
export class AppService {
  private readonly pdfExtract: PDFExtract;

  constructor() {
    this.pdfExtract = new PDFExtract();
  }

  async pdfParse({ buffer }: { buffer: Buffer }) {
    const results: PdfParseBomInterface[] = [];

    const data = await this.pdfExtract.extractBuffer(buffer, {});
    const pages = data.pages.slice(8); // 9페이지 부터 시작.

    pages.forEach((page) => {
      let currentType: PdfParsingType = 'accessory';
      let lastItem: PdfParseBomInterface | null = null;

      const raw = page.content.map((c) => ({ ...c, str: c.str.trim() })); // 빈 문자열 제거.
      const content = raw.filter((c) => {
        if (!c.str) return false; // 빈 문자열 완전 제거.

        if (/^Displaying\s+\d+\s*-\s*\d+\s+of\s+\d+/i.test(c.str)) return false; // Displaying과 같은 텍스트 제거.

        if (this.isTypeMaker(c.str)) return true; // type maker는 무조건 포함. (fabric, trim, labels, artwork)

        return true;
      });

      const typeMaker = content.find((c) => this.isTypeMaker(c.str));

      if (typeMaker) {
        const maker = typeMaker.str.trim();
        const index = maker.indexOf('(');
        const kind =
          index > 0
            ? maker.substring(0, index).trim().toLowerCase()
            : maker.toLowerCase();

        // outsourcing은 추후에 진행할 예정.
        currentType = kind === 'fabric' ? 'fabric' : 'accessory';

        content.splice(content.indexOf(typeMaker), 1); // type maker 제거.
      }

      // typeMaker 라인은 어떠한 필드에도 값이 포함되지 않도록 제거.
      const filtered = content.filter((c) => {
        if (c === typeMaker) return false;

        if (c.str.trim().toLowerCase().startsWith('thread/fusing'))
          return false;

        return true;
      });

      // header product Y 좌표 찾기
      const productYCondition = filtered.find(
        (c) => c.str.toLowerCase() === 'product',
      )?.y;
      if (!productYCondition) return;

      // 같은 Y 좌표에 존재하는 text들로 header grouping.
      const headerItems: PDFExtractText[] = filtered.filter(
        (c) => Math.abs(c.y - productYCondition) < 20,
      );
      const headerMap = this.mappingHeaderMap(headerItems);

      // header를 field key 매핑
      const fieldKeyMap = new Map<number, string>();

      for (const [x, label] of headerMap) {
        const key = this.toCamelCase(label);
        fieldKeyMap.set(x, key);
      }

      // 필수 header 존재 여부 체크
      const required = [
        'product',
        'composition',
        'qty',
        'placement',
        'supplierQuote',
      ];

      const present = Array.from(fieldKeyMap.values());

      if (!required.every((k) => present.includes(k))) return;

      // 테이블 영역 X 범위 결정
      const xList = [...fieldKeyMap.keys()];
      const minX = Math.min(...xList) - 15;
      const maxX = Math.max(...xList) + 15;

      const table = filtered.filter(
        (c) => c.y > productYCondition && c.x > minX && c.x <= maxX,
      );
      const rows = this.mappingRows(table);

      // 각 행별로 행과 컬럼 매핑
      for (const row of rows) {
        const cellMap = new Map<string, string[]>();

        for (const item of row.cells) {
          let bestX: number | null = null;
          let bestDiff = Infinity;

          for (const x of xList) {
            const diff = Math.abs(item.x - x);
            const col = fieldKeyMap.get(x);

            // placement는 줄바꿈이 다른 컬럼보다 많아서 유효 범위를 넓게 처리.
            const tol = col === 'placement' ? 60 : 15;

            if (diff < tol && diff < bestDiff) {
              bestDiff = diff;
              bestX = x;
            }
          }

          if (!bestX) continue;

          const col = fieldKeyMap.get(bestX);
          const arr = cellMap.get(col ?? '') ?? [];

          arr.push(item.str);
          cellMap.set(col ?? '', arr);
        }

        if (!cellMap.has('product') && cellMap.has('placement') && lastItem) {
          lastItem.placement +=
            ' ' + (cellMap.get('placement') ?? []).join(' ');
          continue;
        }

        const result = this.mappingResult(cellMap, currentType);

        // type 매개변수에 따라 필터링
        if (result.product && result.supplierQuote) {
          results.push(result);
          lastItem = result;
        }
      }
    });

    return results;
  }

  private toCamelCase(header: string) {
    return header
      .trim()
      .split(' ')
      .map((w, i) => {
        return i === 0
          ? w.toLowerCase()
          : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      })
      .join('');
  }

  private isTypeMaker(str: string) {
    const s = str.trim().toLowerCase();
    const typeMakers = ['fabric', 'trim', 'labels', 'artwork'];

    return typeMakers.some((maker) => {
      if (!s.startsWith(maker)) return false;

      const rest = s.slice(maker.length).trim();
      if (!rest.startsWith('(') || !rest.endsWith(')')) return false;

      const numString = rest.substring(1, rest.length - 1).trim();
      const num = Number(numString);
      return Number.isInteger(num) && !Number.isNaN(num);
    });
  }

  private mappingHeaderMap(headerItems: PDFExtractText[]) {
    const headerMap: Map<number, string> = new Map();

    headerItems
      .sort((a, b) => a.x - b.x)
      .forEach((c) => {
        let groupByX = [...headerMap.keys()].find(
          (x0) => Math.abs(x0 - c.x) < 15,
        );

        if (!groupByX) groupByX = c.x;

        headerMap.set(groupByX, (headerMap.get(groupByX) ?? '') + ' ' + c.str);
      });

    return headerMap;
  }

  private mappingRows(table: PDFExtractText[]) {
    const rows: Row[] = [];

    for (const cell of table) {
      let places = false;

      for (const row of rows) {
        if (Math.abs(cell.y - row.yAvg) < 20) {
          row.cells.push(cell);
          row.yAvg =
            (row.yAvg * (row.cells.length - 1) + cell.y) / row.cells.length;
          places = true;
          break;
        }
      }

      if (!places) rows.push({ cells: [cell], yAvg: cell.y });
    }

    return rows;
  }

  private mappingResult(
    cellMap: Map<string, string[]>,
    currentType: PdfParsingType,
  ) {
    const object: PdfParseBomInterface = {
      type: currentType,
      product: '',
      composition: '',
      placement: '',
      supplierQuote: '',
      supplierCode: null,

      // 컬러
      mossMos: null,
      blackBlk: null,
      navyNvy: null,
      mauveMau: null,
      royalBlueRbu: null,
      livingCoralPk101: null,
      chalkPinkBlh: null,
      tealTel: null,
      lochmaraPr067: null,
      spindleBl187: null,
      bittersweetRd012: null,
      warmBrownBr132: null,
      caribbeanBlueCrb: null,
      ginFizzPk075: null,
      tempranilloRd089: null,
      graphiteGpt: null,
    };

    for (const [col, arr] of cellMap.entries()) {
      const text = arr.join(' ');

      switch (col) {
        case 'product':
          object.product = text;
          break;
        case 'composition':
          object.composition = text;
          break;
        case 'placement':
          object.placement = text;
          break;
        case 'supplierQuote':
          object.supplierQuote = text;
          break;
        case 'supplierCode':
          object.supplierCode = text;
          break;
        case 'size':
          object.size = text;
          break;
        case 'qty':
          const n = parseFloat(text.replace(/[^\d.]/g, ''));
          object.qty = isNaN(n) ? null : n;
          break;
        default:
          if (object.hasOwnProperty(col)) {
            object[col] = text;
          }
      }
    }

    return object;
  }
}
