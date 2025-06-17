import { Injectable } from '@nestjs/common';
import { PDFExtract } from 'pdf.js-extract';
import { PdfParseBomInterface } from './interfaces/pdf-parse-bom.interface';
import * as _ from 'lodash';

@Injectable()
export class AppService {
  async pdfParse(file: Express.Multer.File) {
    const pdfExtracted = new PDFExtract();
    const data = await pdfExtracted.extractBuffer(file.buffer, {});
    const pages = data.pages.slice(8);

    const results: PdfParseBomInterface[] = [];

    pages.forEach((page) => {
      const content = page.content.filter((c) => c.str.trim() !== '');

      const hasSkipKeyword = content.some((c) =>
        c.str.includes('Fragmented Foxglove'),
      );
      if (hasSkipKeyword) return;

      const productItem = content.find((c) => c.str.includes('Product'));
      if (!productItem) return;

      const headerY = productItem.y;
      const headerItems = content.filter((c) => Math.abs(c.y - headerY) < 13);

      const groupByX: { x: number; values: { y: number; str: string }[] }[] =
        [];

      headerItems
        .sort((a, b) => a.x - b.x || a.y - b.y)
        .forEach((item) => {
          const found = groupByX.find(
            (group) => Math.abs(group.x - item.x) < 2,
          );

          if (found) {
            found.values.push({ y: item.y, str: item.str });
          } else {
            groupByX.push({
              x: item.x,
              values: [{ y: item.y, str: item.str }],
            });
          }
        });

      const headerMap = new Map<number, string>();

      groupByX.forEach((group) => {
        const label = group.values
          .sort((a, b) => a.y - b.y)
          .map((v) => v.str)
          .join(' ');

        headerMap.set(group.x, label);
      });

      const contentData = content.filter((c) => c.y > headerY);
      const rowData = _.values(_.groupBy(contentData, (c) => _.round(c.y, 1)));

      rowData.forEach((row) => {
        const data: Record<string, string | null> = {};

        headerMap.forEach((label, x) => {
          const cells = row.filter((r) => Math.abs(r.x - x) < 2);

          if (cells.length === 0) {
            data[_.camelCase(label)] = null;
          } else {
            const value = _(cells)
              .sortBy('y')
              .map((cell) => cell.str.trim())
              .join(' ');
            data[_.camelCase(label)] = value;
          }
        });

        results.push({
          ...data,
          type: 'fabric',
        });
      });
    });

    return results;
  }
}
