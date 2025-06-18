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

  async pdfParse(file: Express.Multer.File): Promise<PdfParseBomInterface[]> {
    const pdfExtract = new PDFExtract();
    const data = await pdfExtract.extractBuffer(file.buffer, {});
    const pages = data.pages.slice(8);

    const results: PdfParseBomInterface[] = [];
    let lastItem: PdfParseBomInterface | null = null;

    for (const page of pages) {
      const content = page.content.filter((c) => c.str.trim() !== '');
      const headerY = content.find(
        (c) => c.str.trim().toLowerCase() === 'product',
      )?.y;
      if (headerY == null) continue;

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

      const required = [
        'product',
        'composition',
        'qty',
        'placement',
        'supplierQuote',
      ];
      const foundReq = required.filter((k) =>
        [...fieldKeyMap.values()].includes(k),
      );
      if (foundReq.length === 1 && foundReq[0] === 'product') {
        continue;
      }

      const xs = [...fieldKeyMap.keys()];
      const xMin = Math.min(...xs) - 15;
      const xMax = Math.max(...xs) + 15;
      const table = content
        .filter((c) => c.y > headerY && c.x >= xMin && c.x <= xMax)
        .sort((a, b) => a.y - b.y);

      const rows: PDFExtractText[][] = [];
      for (const cell of table) {
        const lastRow = rows[rows.length - 1];
        if (lastRow && Math.abs(cell.y - lastRow[lastRow.length - 1].y) < 20) {
          lastRow.push(cell);
        } else {
          rows.push([cell]);
        }
      }

      for (const row of rows) {
        const cellMap = new Map<string, string[]>();
        for (const item of row) {
          let bestX: number | null = null;
          let bestDiff = Infinity;
          for (const x of xs) {
            const diff = Math.abs(item.x - x);
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

        const hasProduct = cellMap.has('product');
        const onlyPlacement = !hasProduct && cellMap.has('placement');
        if (onlyPlacement && lastItem) {
          const more = cellMap.get('placement')!.join(' ');
          lastItem.placement = (lastItem.placement ?? '') + ' ' + more;
          continue;
        }

        const obj: any = {
          type: 'accessory' as const,

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
            case 'qty':
              const n = parseFloat(text.replace(/[^\d.]/g, ''));
              obj.qty = isNaN(n) ? null : n;
              break;
            default:
              if (obj.hasOwnProperty(key)) {
                obj[key] = text;
              }
          }
        }

        if (!obj.product) continue;

        results.push(obj as PdfParseBomInterface);
        lastItem = obj;
      }
    }

    return results;
  }
}
