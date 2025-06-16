import { Injectable } from '@nestjs/common';
import { PDFExtract } from 'pdf.js-extract';
import { PdfParseBomInterface } from './interfaces/pdf-parse-bom.interface';

@Injectable()
export class AppService {
  async pdfParse(file: Express.Multer.File) {
    // let currentType: 'fabric' | 'accessory' | null = null;
    const results: PdfParseBomInterface[] = [];

    const buffer = file.buffer;
    const pdfExtracted = new PDFExtract();
    const result = await pdfExtracted.extractBuffer(buffer, {});
    const pages = result.pages.slice(8); // 9페이지부터 Parsing.

    pages.forEach((page) => {
      const content = page.content.filter((item) => item.str.trim() !== '');
      const productHeader = content.find(
        (item) => item.str.trim().toLowerCase() === 'product',
      );

      if (!productHeader) return;

      // header 추출하기 (같은 x에 여러 줄인 경우에 병합)
      const headerGroupByX = new Map<number, string[]>();
      const headerLines = content.filter(
        (item) => item.y >= productHeader.y && item.y < productHeader.y + 10,
      );

      for (const data of headerLines) {
        const x = data.x;
        const prevData = headerGroupByX.get(x) || [];
        headerGroupByX.set(x, [...prevData, data.str.trim()]);
      }

      const headers = [...headerGroupByX.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([x, lines]) => ({
          x,
          headerName: lines.join(' ').replace(/\s+/g, ' ').trim(),
        }));

      const headerXList = headers.map((h) => h.x);

      const sortedLines = content
        .filter((i) => i.y > productHeader.y)
        .sort((a, b) => a.y - b.y);

      const rowBuffer: Record<string, string[]> = {};
      const flushBuffer = () => {
        if (Object.keys(rowBuffer).length === 0) return;

        const toValue = (key: string) =>
          rowBuffer[key]
            ?.map((v) => v.trim())
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim() || null;

        const result: PdfParseBomInterface = {
          type: 'fabric',
          product: toValue('Product'),
          composition: toValue('Composition'),
          size: toValue('Size'),
          qty: toValue('Qty'),
          placement: toValue('Placement'),
          supplierQuote: toValue('Supplier Quote'),
          supplierCode: toValue('Supplier Code'),
          mossMos: toValue('Moss MOS'),
          black: toValue('Black BLK'),
          navy: toValue('Navy NVY'),
          royalBlue: toValue('Royal Blue RBU'),
          livingCoral: toValue('Living Coral PK101'),
          chalkPink: toValue('Chalk Pink BLH'),
          teal: toValue('Teal TEL'),
          lochmara: toValue('Lochmara PR067'),
          spindle: toValue('Spindle BL187'),
          bittersweet: toValue('Bittersweet RD012'),
          warmBrown: toValue('Warm Brown BR132'),
          caribbeanBlue: toValue('Caribbean Blue CRB'),
          ginFizz: toValue('Gin Fizz PK075'),
          tempranillo: toValue('Tempranillo RD089'),
          graphite: toValue('Graphite GPT'),
        };
        results.push(result);
        Object.keys(rowBuffer).forEach((k) => delete rowBuffer[k]);
      };

      for (const line of sortedLines) {
        let closestX = headerXList[0];
        let minDiff = Math.abs(line.x - closestX);

        for (const hx of headerXList) {
          const diff = Math.abs(line.x - hx);
          if (diff < minDiff) {
            closestX = hx;
            minDiff = diff;
          }
        }

        const columnName = headers.find((h) => h.x === closestX)?.headerName;
        if (!columnName) continue;

        // 기준점: Product 컬럼에 code-like 문자열이 등장할 때 새 row 시작
        if (columnName === 'Product' && line.str.match(/[A-Z]{3}-\d{6}/)) {
          flushBuffer();
        }

        const prev = rowBuffer[columnName] || [];
        rowBuffer[columnName] = [...prev, line.str.trim()];
      }

      flushBuffer();
    });

    return results;
  }
}
