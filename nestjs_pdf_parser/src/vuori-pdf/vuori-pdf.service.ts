import { Injectable } from '@nestjs/common';
import { PDFExtract, PDFExtractText } from 'pdf.js-extract';
import { PdfParsingType } from 'src/common/types/pdf-parsing.type';
import { VuoriBomInterface } from './interfaces/vuouri-bom.interface';
import { VuoriBomRequiredField } from './types/vuori-bom-required-field.type';
import { Row } from 'src/common/interfaces/row.interface';

@Injectable()
export class VuoriPdfService {
  private readonly pdfExtract: PDFExtract;
  private readonly types = [
    'fabric',
    'interfacing',
    'trim',
    'labels',
    'packaging',
    'thread',
  ];

  constructor() {
    this.pdfExtract = new PDFExtract();
  }

  async parse({ buffer }: { buffer: Buffer }) {
    const results: VuoriBomInterface[] = [];
    const data = await this.pdfExtract.extractBuffer(buffer, {});
    const pages = data.pages;

    pages.forEach((page) => {
      let currentType: PdfParsingType = 'accessory';
      let lastItem: VuoriBomInterface | undefined;

      const raw = page.content.map((c) => ({ ...c, str: c.str.trim() }));
      const content = raw.filter((c) => {
        if (!c.str) return false;

        if (/^Displaying\s+\d+\s*-\s*\d+\s+of\s+\d+/i.test(c.str)) return false;

        if (this.isTypeMaker(c.str)) return true;

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

        currentType = kind === 'fabric' ? 'fabric' : 'accessory';
        content.splice(content.indexOf(typeMaker), 1);
      }

      const filteredContent = content.filter((c) => {
        if (c === typeMaker) return false;

        return true;
      });

      const productYCondition = filteredContent.find(
        (c) => c.str.toLowerCase() === 'product',
      )?.y;

      if (!productYCondition) return;

      const headerItems: PDFExtractText[] = filteredContent.filter(
        (c) => Math.abs(c.y - productYCondition) < 20,
      );

      const headerMap = this.mappingHeaderMap(headerItems);

      const fieldKeyMap = new Map<number, string>();
      const requiredFields: (keyof VuoriBomRequiredField)[] = [
        'product',
        'placement',
        'detailedComposition',
        'supplier',
        'supplierRefNo',
        'uom',
        'weight',
        'color',
      ];

      for (const [x, label] of headerMap) {
        let value = this.toCamelCase(label);

        if (value === 'supplierRef#') {
          value = 'supplierRefNo';
        }

        if (requiredFields.includes(value as keyof VuoriBomRequiredField)) {
          if (value === 'color') {
            const existingX = [...fieldKeyMap.entries()].find(
              ([_, v]) => v === 'color',
            )?.[0];

            if (typeof existingX === 'number' && existingX < x) {
              continue;
            } else {
              fieldKeyMap.set(x, value);
            }
          }

          fieldKeyMap.set(x, value);
        }
      }

      const present = Array.from(fieldKeyMap.values());
      if (!requiredFields.every((k) => present.includes(k))) return;

      const xList = [...fieldKeyMap.keys()];
      const minX = Math.min(...xList) - 15;
      const maxX = Math.max(...xList) + 15;

      const table = filteredContent.filter(
        (c) => c.y > productYCondition && c.x > minX && c.x <= maxX,
      );

      const rows = this.mappingRows(table);

      for (const row of rows) {
        const cellMap = new Map<string, string[]>();

        for (const item of row.cells) {
          let bestX: number | null = null;
          let bestDiff = Infinity;

          for (const x of xList) {
            const diff = Math.abs(item.x - x);
            const column = fieldKeyMap.get(x);

            const tol = column === 'product' ? 60 : 15;

            if (diff < tol && diff < bestDiff) {
              bestDiff = diff;
              bestX = x;
            }
          }

          if (!bestX) continue;

          const column = fieldKeyMap.get(bestX);
          const arr = cellMap.get(column ?? '') ?? [];

          arr.push(item.str);
          cellMap.set(column ?? '', arr);
        }

        if (!cellMap.has('product') && cellMap.has('placement') && lastItem) {
          lastItem.placement += ' ' + (cellMap.get('placement') ?? []).join('');
          continue;
        }

        const result = this.mappingResult(cellMap, currentType);

        if (result.description) {
          results.push(result);
          lastItem = result;
        }
      }
    });

    return results;
  }

  private isTypeMaker(str: string) {
    const s = str.trim().toLowerCase();

    return this.types.some((type) => {
      if (!s.startsWith(type)) return false;

      const rest = s.slice(type.length).trim();
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
    const object: VuoriBomInterface = {
      type: currentType,
      class: '',
      description: '',
      brandItemNo: '',
      placement: '',
      supplierNo: '',
      supplier: '',
      unit: '',
      weight: '',
      content: '',
      fabricColorName: '',
    };

    for (const [col, arr] of cellMap.entries()) {
      const text = arr.join(' ');

      switch (col) {
        case 'product':
          const match = text.match(/\b[A-Z]\d{4,}\b/)!;

          const brandItemNo = match?.[0];
          const description = brandItemNo
            ? text.replace(brandItemNo, '').trim()
            : text;

          object.description = description;
          object.brandItemNo = brandItemNo;
          break;

        case 'placement':
          object.placement = text;
          break;

        case 'detailedComposition':
          object.content = text;
          break;

        case 'supplier':
          object.supplier = text;
          break;

        case 'supplierRefNo':
          object.supplierNo = text;
          break;

        case 'uom':
          object.unit = text;
          break;

        case 'weight':
          object.weight = text;
          break;

        case 'color':
          object.fabricColorName = text;
          break;
      }
    }

    return object;
  }
}
