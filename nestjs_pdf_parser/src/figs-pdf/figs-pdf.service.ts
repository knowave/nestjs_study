import { Injectable } from '@nestjs/common';
import { PDFExtract, PDFExtractText } from 'pdf.js-extract';
import { FigsBomInterface } from './interfaces/figs-bom.interface';
import { PdfParsingType } from 'src/common/types/pdf-parsing.type';
import { Row } from 'src/common/interfaces/row.interface';

@Injectable()
export class FigsPdfService {
  private pdfExtract = new PDFExtract();
  private readonly types: string[] = [
    'fabric',
    'trim',
    'labels',
    'artwork',
    'thread/fusing',
    'packaging',
    'heat transfers',
  ];
  private readonly requiredColumns: string[] = [
    'product',
    'composition',
    'qty',
    'placement',
    'supplierQuote',
    'blackBlk',
    'navyNvy',
    'warmBrownBr132',
  ];

  async parse(buffer: Buffer): Promise<FigsBomInterface[]> {
    const results: FigsBomInterface[] = [];
    const data = await this.pdfExtract.extractBuffer(buffer, {});
    const pages = data.pages.slice(8); // 9페이지부터 시작

    for (const page of pages) {
      // 문자열 정규화 및 페이지 정보 text 제거
      const lines = page.content
        .map((c) => ({ ...c, str: c.str.trim() }))
        .filter(
          (c) =>
            c.str &&
            !/^Displaying\s+\d+/.test(c.str) &&
            !/^Page\s+\d+\s+of\s+\d+/.test(c.str),
        );

      // 이 페이지의 모든 type marker 정보 수집
      const markers: { y: number; type: PdfParsingType; raw: string }[] = lines
        .filter((c) => this.isTypeMaker(c.str.toLowerCase()))
        .map((c) => ({
          y: c.y,
          type: c.str.toLowerCase().startsWith('fabric')
            ? 'fabric'
            : 'accessory',
          raw: c.str.toLowerCase(),
        }));

      // header Y좌표 찾기
      const productHeader = lines.find(
        (c) => c.str.toLowerCase() === 'product',
      );
      if (!productHeader) continue;

      const headerY = productHeader.y;

      // 헤더 아이템 그룹핑 및 fieldKeyMap 생성
      const headerItems = lines
        .filter((c) => Math.abs(c.y - headerY) < 20)
        .sort((a, b) => a.x - b.x);
      const headerMap = new Map<number, string>();

      headerItems.forEach((c) => {
        const keyX =
          [...headerMap.keys()].find((x0) => Math.abs(x0 - c.x) < 15) ?? c.x;
        const prev = headerMap.get(keyX) ?? '';

        headerMap.set(keyX, (prev + ' ' + c.str).trim());
      });

      // 필수 컬럼만 추출
      const requiredCols = new Set(this.requiredColumns);
      const fieldKeyMap = new Map<number, string>();

      headerMap.forEach((label, x) => {
        const key = this.toCamelCase(label);

        if (requiredCols.has(key)) {
          fieldKeyMap.set(x, key);
        }
      });

      // 필수 헤더 체크
      const required = this.requiredColumns;
      if (!required.every((k) => Array.from(fieldKeyMap.values()).includes(k)))
        continue;

      // 테이블 영역 필터링 및 row 생성
      const xs = Array.from(fieldKeyMap.keys());
      const minX = Math.min(...xs) - 15;
      const maxX = Math.max(...xs) + 15;
      const tableContent = lines.filter(
        (c) => c.y > headerY && c.x > minX && c.x <= maxX,
      );
      const rows = this.mappingRows(tableContent);

      // 각 row 처리
      let lastIndex: number | null = null;
      let lastAccClassification: string | null = null;

      for (const row of rows) {
        const cellMap = this.mapCells(row.cells, fieldKeyMap);
        const productArray = cellMap.get('product');
        const productText = productArray?.join(' ').trim() ?? '';

        const isProductCodePattern = this.isProductCodePattern(productText);

        if (!isProductCodePattern && lastIndex !== null) {
          for (const key of fieldKeyMap.values()) {
            if (cellMap.has(key)) {
              const text = cellMap.get(key)!.join(' ').trim();
              results[lastIndex][key] += ' ' + text;
            }
          }

          continue;
        }

        const { type: rowType, raw } = this.getRowType(markers, row.yAvg);
        const result = this.mappingResult(cellMap, rowType);

        if (rowType === 'accessory') {
          const beforeParen = raw?.split('(')[0].trim();
          const accClassification = beforeParen?.includes('/')
            ? beforeParen.split('/')[0].trim()
            : beforeParen;

          result.accClassification = accClassification ?? lastAccClassification;
          if (accClassification) lastAccClassification = accClassification;
        }

        if (result.product && result.supplierQuote) {
          results.push(result);
          lastIndex = results.length - 1;
        }
      }
    }

    return results;
  }

  private toCamelCase(header: string): string {
    return header
      .split(' ')
      .map((w, i) =>
        i === 0
          ? w.toLowerCase()
          : w[0].toUpperCase() + w.slice(1).toLowerCase(),
      )
      .join('');
  }

  private isTypeMaker(str: string): boolean {
    return this.types.some((m) => {
      if (!str.startsWith(m)) return false;
      const rest = str.slice(m.length).trim();
      return rest.startsWith('(') && rest.endsWith(')');
    });
  }

  private mappingRows(table: PDFExtractText[]): Row[] {
    const rows: Row[] = [];

    for (const cell of table) {
      let placed = false;
      for (const row of rows) {
        if (Math.abs(cell.y - row.yAvg) < 15) {
          row.cells.push(cell);
          row.yAvg =
            (row.yAvg * (row.cells.length - 1) + cell.y) / row.cells.length;
          placed = true;
          break;
        }
      }

      if (!placed) rows.push({ cells: [cell], yAvg: cell.y });
    }
    return rows;
  }

  private mapCells(
    cells: PDFExtractText[],
    fieldKeyMap: Map<number, string>,
  ): Map<string, string[]> {
    const map = new Map<string, string[]>();
    const xs = Array.from(fieldKeyMap.keys());

    if (
      cells.length === 1 &&
      this.types.some((t) => cells[0].str.trim().toLowerCase().startsWith(t))
    ) {
      return map;
    }

    for (const cell of cells) {
      let bestX: number | null = null;
      let bestDiff = Infinity;

      for (const x of xs) {
        const diff = Math.abs(cell.x - x);

        const key = fieldKeyMap.get(x)!;
        const tol = key === 'placement' ? 30 : 15;

        if (diff < tol && diff < bestDiff) {
          bestDiff = diff;
          bestX = x;
        }
      }
      if (bestX !== null) {
        const key = fieldKeyMap.get(bestX)!;
        const arr = map.get(key) ?? [];
        arr.push(cell.str);
        map.set(key, arr);
      }
    }
    return map;
  }

  private getRowType(
    markers: { y: number; type: PdfParsingType; raw: string }[],
    yAvg: number,
  ): { type: PdfParsingType; raw: string | null } {
    return (
      markers.filter((m) => m.y <= yAvg).sort((a, b) => b.y - a.y)[0] || {
        type: 'accessory',
        raw: null,
      }
    );
  }

  private mappingResult(
    cellMap: Map<string, string[]>,
    currentType: PdfParsingType,
  ): FigsBomInterface {
    const obj: FigsBomInterface = {
      type: currentType,
      product: '',
      accClassification: '', // typeMaker인 'thread', 'trim', 'packaging' 과 같은 값들을 추가.
      composition: '',
      placement: '',
      supplierQuote: '',
      supplierCode: null,

      // color
      blackBlk: '',
      navyNvy: '',
      warmBrownBr132: '',
    } as FigsBomInterface;

    for (const [col, arr] of cellMap.entries()) {
      const text = arr.join(' ');
      switch (col) {
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

        case 'qty':
          const n = parseFloat(text.replace(/[^\d.]/g, ''));
          obj.qty = isNaN(n) ? 0 : n;
          break;

        default:
          if (col in obj) (obj as any)[col] = text;
      }
    }
    return obj;
  }

  private isProductCodePattern(text: string): boolean {
    const str = text.trim();
    // 최소 길이 체크
    if (str.length < 10) return false;

    // 0~2: prefix / 3: '-' / 4~9: digits
    if (str[3] !== '-') return false;

    // prefix 영문 확인 (A–Z, a–z)
    for (let i = 0; i < 3; ++i) {
      const code = str.charCodeAt(i);
      const isAlpha = (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
      if (!isAlpha) return false;
    }

    // 뒤 6글자 숫자 확인
    for (let i = 4; i < 10; ++i) {
      const c = str[i];
      if (c < '0' || c > '9') return false;
    }

    // 숫자 뒤에 나오는 문자는 공백이거나 아예 없으면 OK
    const next = str[10];
    if (next && next !== ' ') return false;

    return true;
  }
}
