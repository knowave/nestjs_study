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
          : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
      )
      .join('');
  }

  private isTypeMaker(str: string): boolean {
    const s = str.trim().toLowerCase();
    const makers = ['fabric', 'thread/fusing', 'trim', 'labels', 'artwork'];

    return makers.some((maker) => {
      if (!s.startsWith(maker)) return false;
      const rest = s.slice(maker.length).trim();
      if (!rest.startsWith('(') || !rest.endsWith(')')) return false;
      const numStr = rest.substring(1, rest.length - 1).trim();
      const n = Number(numStr);
      return Number.isInteger(n) && !Number.isNaN(n);
    });
  }

  async pdfParse(file: Express.Multer.File): Promise<PdfParseBomInterface[]> {
    const pdfExtract = new PDFExtract();
    const data = await pdfExtract.extractBuffer(file.buffer, {});
    const pages = data.pages.slice(8); // 9페이지부터

    const results: PdfParseBomInterface[] = [];
    let lastItem: PdfParseBomInterface | null = null;

    for (const page of pages) {
      // 1) 노이즈 & 빈 문자열 제거
      const raw = page.content.map((c) => ({ ...c, str: c.str.trim() }));
      // const content = raw.filter((c) => {
      //   if (!c.str) return false;
      //   if (/^Displaying\s+\d+/.test(c.str)) return false;
      //   return true;
      // });

      const content = raw.filter((c) => {
        // 1-1) 완전 빈 문자열 제거
        if (!c.str) return false;

        // 1-2) Displaying n–m of k 같은 페이징 텍스트만 제거
        if (/^Displaying\s+\d+\s*-\s*\d+\s+of\s+\d+/i.test(c.str)) return false;

        // 1-3) Type Marker(Fabric, Thread/Fusing 등)은 무조건 살린다
        if (this.isTypeMaker(c.str)) return true;

        return true;
      });

      // 2) currentType 감지 (Fabric(n), Thread/Fusing(n), Trim(n), Labels(n) …)
      let currentType: 'fabric' | 'accessory' = 'accessory';
      const typeMarker = content.find((c) => {
        console.log(`content string value ${c.str}`);
        return this.isTypeMaker(c.str);
      });

      if (typeMarker) {
        const marker = typeMarker.str.trim();
        const idx = marker.indexOf('(');
        const kind =
          idx > 0
            ? marker.substring(0, idx).trim().toLowerCase()
            : marker.toLowerCase();

        currentType = kind === 'fabric' ? 'fabric' : 'accessory';

        // 이 줄을 content에서 제거
        content.splice(content.indexOf(typeMarker), 1);
      }

      // typeMarker 라인은 테이블에도 들어가지 않도록 제거
      const filtered = content.filter((c) => {
        // isTypeMaker 로 잡힌 marker (Fabric(3), Trim(6), Labels(2), Artwork(1) 등)
        if (c === typeMarker) return false;

        // Thread/Fusing(n) 하드코딩 제거
        if (c.str.trim().toLowerCase().startsWith('thread/fusing'))
          return false;

        return true;
      });

      // 헤더 Y좌표 찾기 (product 컬럼)
      const headerY = filtered.find(
        (c) => c.str.toLowerCase() === 'product',
      )?.y;
      if (headerY == null) continue;

      // 같은 Y에 있는 텍스트들로 헤더 그룹핑
      const headerItems = filtered.filter((c) => Math.abs(c.y - headerY) < 20);
      const headerMap = new Map<number, string>();
      headerItems
        .sort((a, b) => a.x - b.x)
        .forEach((c) => {
          let grpX = [...headerMap.keys()].find(
            (x0) => Math.abs(x0 - c.x) < 15,
          );
          if (!grpX) grpX = c.x;
          headerMap.set(grpX, (headerMap.get(grpX) ?? '') + ' ' + c.str);
        });

      // 헤더 → 필드키 매핑
      const fieldKeyMap = new Map<number, string>();
      for (const [x, label] of headerMap) {
        const key = this.toCamelCase(label);
        fieldKeyMap.set(x, key);
      }

      // 필수 5개 헤더 모두 없으면 스킵
      const required = [
        'product',
        'composition',
        'qty',
        'placement',
        'supplierQuote',
      ];

      const present = Array.from(fieldKeyMap.values());
      if (!required.every((k) => present.includes(k))) {
        continue;
      }

      // 테이블 영역 X범위 결정
      const xs = [...fieldKeyMap.keys()];
      const xMin = Math.min(...xs) - 15;
      const xMax = Math.max(...xs) + 15;
      const table = filtered
        .filter((c) => c.y > headerY && c.x >= xMin && c.x <= xMax)
        .sort((a, b) => a.y - b.y);

      // 행 클러스터링 (ΔY<20px)
      interface Row {
        cells: PDFExtractText[];
        yAvg: number;
      }
      const rows: Row[] = [];
      for (const cell of table) {
        let placed = false;
        for (const row of rows) {
          if (Math.abs(cell.y - row.yAvg) < 20) {
            row.cells.push(cell);
            row.yAvg =
              (row.yAvg * (row.cells.length - 1) + cell.y) / row.cells.length;
            placed = true;
            break;
          }
        }
        if (!placed) {
          rows.push({ cells: [cell], yAvg: cell.y });
        }
      }

      // 각 행마다 셀 → 컬럼 매핑
      for (const row of rows) {
        const cellMap = new Map<string, string[]>();
        for (const item of row.cells) {
          let bestX: number | null = null;
          let bestDiff = Infinity;
          for (const x of xs) {
            const diff = Math.abs(item.x - x);
            const col = fieldKeyMap.get(x)!;

            // placement는 줄바꿈이 다른 컬럼보다 많기 때문에 placement만 범위 넓게, 나머진 15px
            const tol = col === 'placement' ? 60 : 15;
            if (diff < tol && diff < bestDiff) {
              bestDiff = diff;
              bestX = x;
            }
          }

          if (bestX == null) continue;
          const col = fieldKeyMap.get(bestX)!;
          const arr = cellMap.get(col) ?? [];
          arr.push(item.str);
          cellMap.set(col, arr);
        }

        // product 열이 없고 placement만 있으면 이전 레코드에 합쳐 붙임
        if (!cellMap.has('product') && cellMap.has('placement') && lastItem) {
          lastItem.placement += ' ' + cellMap.get('placement')!.join(' ');
          continue;
        }

        const obj: PdfParseBomInterface = {
          type: currentType,
          product: null,
          composition: null,
          qty: null,
          size: null,
          placement: null,
          supplierQuote: null,
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
            case 'qty':
              const n = parseFloat(text.replace(/[^\d.]/g, ''));
              obj.qty = isNaN(n) ? null : n;
              break;
            default:
              if (obj.hasOwnProperty(col)) {
                obj[col] = text;
              }
          }
        }

        if (obj.product !== null && obj.supplierQuote != null) {
          results.push(obj);
          lastItem = obj;
        }
      }
    }

    return results;
  }
}
