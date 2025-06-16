import { Injectable } from '@nestjs/common';
import { PDFExtract } from 'pdf.js-extract';

export interface ParsedBOMRow {
  type: 'fabric' | 'accessory';
  reference: string;
  detail: string;
  composition?: string;
  qty?: string;
  placement?: string;
  supplier?: string;
  supplierCode?: string;
  size?: string;
}

@Injectable()
export class AppService {
  async pdfParse(file: Express.Multer.File) {
    const buffer = file.buffer;
    const pdfExtracted = new PDFExtract();
    const result = await pdfExtracted.extractBuffer(buffer, {});
    const pages = result.pages.slice(8);
    const rows: ParsedBOMRow[] = [];
    const headersByPage: Record<number, { x: number; headerName: string }[]> =
      [];
    let currentSelection: 'fabric' | 'accessory' | null = null;

    pages.forEach((page, idx) => {
      const content = page.content.filter((item) => item.str.trim() !== '');
      const pageNumber = idx + 9;

      // check if current selection is not null
      const section = content.find((item) => {
        const text = item.str.trim().toLowerCase();
        return (
          text.includes('fabric') || text.includes('artWork') || 'accessory'
        );
      });

      if (section) {
        const text = section.str.trim().toLowerCase();
        if (text.includes('fabric')) currentSelection = 'fabric';
        else if (text.includes('artwork')) currentSelection = null;
        else currentSelection = 'accessory';
      }

      if (!currentSelection) return;

      const productHeader = content.find(
        (item) => item.str.trim().toLowerCase() === 'product',
      );

      if (!productHeader) return;

      const productHeaderY = productHeader.y;
      const headers = content
        .filter((item) => Math.abs(item.y - productHeaderY) < 1)
        .sort((a, b) => a.x - b.x)
        .map((item) => ({
          x: item.x,
          headerName: item.str.trim(),
        }));

      const headerXList = headers.map((h) => h.x);

      // y값으로 행 grouping
      const yGrouped = new Map<number, { x: number; str: string }[]>();

      for (const item of content.filter((i) => i.y > productHeaderY)) {
        const yKey = Math.round(item.y * 10) / 10;
        const list = yGrouped.get(yKey) || [];

        list.push({ x: item.x, str: item.str.trim() });
        yGrouped.set(yKey, list);
      }

      headersByPage[pageNumber] = headers;

      // 행 단위로 데이터 파싱
      for (const [, cellList] of yGrouped) {
        const row: Record<string, string[]> = {};

        for (const cell of cellList) {
          // 가장 가까운 x header 찾기
          let closestX = headerXList[0];
          let minDiff = Math.abs(cell.x - closestX);

          for (const hx of headerXList) {
            const diff = Math.abs(cell.x - hx);

            if (diff < minDiff) {
              closestX = hx;
              minDiff = diff;
            }
          }

          const columnName = headers.find((h) => h.x === closestX)?.headerName;
          if (!columnName) continue;

          console.log(columnName);

          const prev = row[columnName] || [];
          row[columnName] = [...prev, cell.str];
        }

        const productCell = row['Product']?.join(' ').trim();
        if (!productCell) continue;

        // reference, detail 추출
        const parts = productCell.split(' ');
        const reference =
          parts.find((p) => p.includes('-') && p.length === 10) || '';
        const detail = productCell.replace(reference, '').trim();

        if (!reference) continue;

        rows.push({
          type: currentSelection,
          reference,
          detail,
          composition: row['Composition']?.join(' ').trim(),
          qty: row['Qty']?.join(' ').trim(),
          placement: row['Placement']?.join(' ').trim(),
          supplier: row['Supplier']?.join(' ').trim(),
          supplierCode: row['Supplier Code']?.join(' ').trim(),
          size: row['Size']?.join(' ').trim(),
        });
      }
    });
    // console.log(headersByPage);
    return rows;
  }
}
