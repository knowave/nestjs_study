// src/app.service.ts
import { Injectable } from '@nestjs/common';
import { PDFExtract, PDFExtractText } from 'pdf.js-extract';
import { PdfParseBomInterface } from './interfaces/pdf-parse-bom.interface';

@Injectable()
export class AppService {
  private toCamelCase(header: string): string {
    return header
      .trim()
      .split(' ')
      .map((w, i) =>
        i === 0
          ? w.toLowerCase()
          : w[0].toUpperCase() + w.slice(1).toLowerCase(),
      )
      .join('');
  }

  async pdfParse(file: Express.Multer.File): Promise<PdfParseBomInterface[]> {
    const pdfExtract = new PDFExtract();
    const data = await pdfExtract.extractBuffer(file.buffer, {});
    const pages = data.pages.slice(8); // 9페이지부터

    const results: PdfParseBomInterface[] = [];
    let lastItem: PdfParseBomInterface | null = null;
    let currentType: 'fabric' | 'accessory' | null = null;

    // 다섯 개 필수 키
    const required = [
      'product',
      'composition',
      'qty',
      'placement',
      'supplierQuote',
    ];

    for (const page of pages) {
      const content = page.content.filter((c) => c.str.trim() !== '');

      // 1) 헤더 Y 찾기
      const headerY = content.find(
        (c) => c.str.trim().toLowerCase() === 'product',
      )?.y;
      if (headerY == null) continue;

      // 2) 헤더 그룹화 → fieldKeyMap 생성
      const headerItems = content.filter((c) => Math.abs(c.y - headerY) < 20);
      const headerMap = new Map<number, string>();
      headerItems
        .sort((a, b) => a.x - b.x)
        .forEach((c) => {
          let grpX = [...headerMap.keys()].find(
            (x0) => Math.abs(x0 - c.x) < 15,
          );
          if (!grpX) grpX = c.x;
          headerMap.set(grpX, (headerMap.get(grpX) ?? '') + ' ' + c.str.trim());
        });

      const fieldKeyMap = new Map<number, string>();
      for (const [x, label] of headerMap) {
        const key = label
          .trim()
          .toLowerCase()
          .replace(/ +/g, ' ')
          .split(' ')
          .map((w, i) => (i ? w[0].toUpperCase() + w.slice(1) : w))
          .join('');
        fieldKeyMap.set(x, key);
      }

      // 3) 페이지 단위: 다섯 개 모두 존재해야 진행
      const foundReq = required.filter((k) =>
        Array.from(fieldKeyMap.values()).includes(k),
      );
      if (foundReq.length !== required.length) continue;

      // 4) 테이블 영역 한정
      const xList = [...fieldKeyMap.keys()];
      const xMin = Math.min(...xList) - 15;
      const xMax = Math.max(...xList) + 15;
      const table = content
        .filter((c) => c.y > headerY && c.x >= xMin && c.x <= xMax)
        .sort((a, b) => a.y - b.y);

      // 5) 행 클러스터링
      const rows: PDFExtractText[][] = [];
      for (const cell of table) {
        const lastRow = rows[rows.length - 1];
        if (lastRow && Math.abs(cell.y - lastRow[lastRow.length - 1].y) < 20) {
          lastRow.push(cell);
        } else {
          rows.push([cell]);
        }
      }

      // 6) 각 행 처리
      for (const row of rows) {
        // 6-1) Fabric/Trim 섹션 헤더 감지
        const section = row
          .map((c) => c.str.trim())
          .find((s) => /^\s*(fabric|artwork)\s*\(\d+\)/i.test(s));
        if (section) {
          currentType = section.toLowerCase().startsWith('fabric')
            ? 'fabric'
            : 'accessory';
          continue;
        }

        // 6-2) 셀 → 컬럼 매핑
        const cellMap = new Map<string, string[]>();
        for (const item of row) {
          let bestX: number | null = null;
          let bestDiff = Infinity;
          for (const x of xList) {
            const diff = Math.abs(item.x - x);
            // placement만 허용 오차 크게
            const tol = fieldKeyMap.get(x) === 'placement' ? 60 : 15;
            if (diff < tol && diff < bestDiff) {
              bestDiff = diff;
              bestX = x;
            }
          }
          if (!bestX) continue;
          const key = fieldKeyMap.get(bestX)!;
          const arr = cellMap.get(key) ?? [];
          arr.push(item.str.trim());
          cellMap.set(key, arr);
        }

        // 6-3) 행 단위: 다섯 개 필수 컬럼 **모두** 없는 행은 건너뜀
        const hasAllRequired = required.every((k) => cellMap.has(k));
        if (!hasAllRequired) continue;

        // 6-4) only placement 라인 (product 없는 추가 줄)은 이전에 붙이기
        const onlyPlacement =
          !cellMap.has('product') && cellMap.has('placement');
        if (onlyPlacement && lastItem) {
          lastItem.placement =
            (lastItem.placement ?? '') +
            ' ' +
            cellMap.get('placement')!.join(' ');
          continue;
        }

        // 6-5) 객체 초기화
        const obj: any = {
          type: currentType,
          product: null,
          composition: null,
          qty: null,
          size: null,
          placement: null,
          supplierQuote: null,
          supplierCode: null,
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

        // 6-6) cellMap → obj
        for (const [key, arr] of cellMap) {
          const text = arr.join(' ');
          switch (key) {
            case 'product':
              obj.product = text;
              break;
            case 'composition':
              obj.composition = text;
              break;
            case 'placement':
              obj.placement = text;
              break;
            case 'supplierQuote':
              obj.supplierQuote = text;
              break;
            case 'supplierCode':
              obj.supplierCode = text;
              break;
            case 'size':
              obj.size = text;
              break;
            case 'qty': {
              const n = parseFloat(text.replace(/[^\d.]/g, ''));
              obj.qty = isNaN(n) ? null : n;
              break;
            }
            default:
              if (Object.prototype.hasOwnProperty.call(obj, key))
                obj[key] = text;
          }
        }

        // 6-7) product가 없으면 건너뜀
        if (!obj.product) continue;

        results.push(obj as PdfParseBomInterface);
        lastItem = obj;
      }
    }

    return results;
  }
}
