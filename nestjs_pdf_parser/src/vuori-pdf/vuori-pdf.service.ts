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

  private readonly requiredFields: (keyof VuoriBomRequiredField)[] = [
    'product',
    'placement',
    'detailedComposition',
    'supplier',
    'supplierRefNo',
    'uom',
    'weight',
    'color',
  ];

  constructor() {
    this.pdfExtract = new PDFExtract();
  }

  async parse({ buffer }: { buffer: Buffer }) {
    const results: VuoriBomInterface[] = [];
    const data = await this.pdfExtract.extractBuffer(buffer, {});
    const pages = data.pages;

    for (const page of pages) {
      const lines = page.content
        .map((c) => ({ ...c, str: c.str.trim() }))
        .filter(
          (c) =>
            c.str &&
            !/^Displaying\s+\d+/.test(c.str) &&
            !/^Page\s+\d+\s+of\s+\d+/.test(c.str),
        );

      const typeMakers: { y: number; type: PdfParsingType; raw: string }[] =
        lines
          .filter((c) => this.isTypeMaker(c.str.toLowerCase()))
          .map((c) => ({
            y: c.y,
            type: c.str.toLowerCase().startsWith('fabric')
              ? 'fabric'
              : 'accessory',
            raw: c.str.toLowerCase(),
          }));

      const productHeader = lines.find(
        (c) => c.str.toLowerCase() === 'product',
      );

      if (!productHeader) continue;

      const headerY = productHeader.y;

      const headerItems = lines
        .filter((c) => Math.abs(c.y - headerY) < 20)
        .sort((a, b) => a.x - b.x);

      //   const headerMap = this.mappingHeaderMap(headerItems);
      const headerMap = new Map<number, string>();

      for (const c of headerItems) {
        const keyX =
          [...headerMap.keys()].find((x0) => Math.abs(x0 - c.x) < 15) ?? c.x;
        const prev = headerMap.get(keyX) ?? '';

        headerMap.set(keyX, (prev + ' ' + c.str).trim());
      }

      const fieldKeyMap = new Map<number, string>();

      headerMap.forEach((label, x) => {
        let value = this.toCamelCase(label);

        if (value === 'supplierRef#') {
          value = 'supplierRefNo';
        }

        if (
          this.requiredFields.includes(value as keyof VuoriBomRequiredField)
        ) {
          if (value === 'color') {
            const existingX = [...fieldKeyMap.entries()].find(
              ([_, v]) => v === 'color',
            )?.[0];

            if (typeof existingX === 'number' && existingX < x) {
              return;
            } else {
              fieldKeyMap.set(x, value);
            }
          }

          fieldKeyMap.set(x, value);
        }
      });

      const present = Array.from(fieldKeyMap.values());
      if (!this.requiredFields.every((k) => present.includes(k))) continue;

      const xs = Array.from(fieldKeyMap.keys());
      const minX = Math.min(...xs) - 20;
      const maxX = Math.max(...xs) + 20;
      const tableContent = lines.filter(
        (c) => c.y > headerY && c.x > minX && c.x <= maxX,
      );

      const rows = this.mappingRows(tableContent);

      let lastIndex: number | null = null;

      for (const row of rows) {
        const cellMap = this.mapCells(row.cells, fieldKeyMap);
        const productArray = cellMap.get('product');
        const productValue = productArray?.join(' ').trim() ?? '';

        const isProductCodePattern = this.isProductCodePattern(productValue);

        if (!isProductCodePattern && lastIndex !== null) {
          for (const v of fieldKeyMap.values()) {
            if (cellMap.has(v)) {
              const txt = cellMap.get(v)!.join(' ').trim();
              results[lastIndex][v] += ' ' + txt;
            }
          }

          continue;
        }

        if (!cellMap.has('product')) continue;

        const { type: rowType } = this.getRowType(typeMakers, row.yAvg);
        const result = this.mappingResult(cellMap, rowType);

        results.push(result);
        lastIndex = results.length - 1;
      }
    }

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
        if (Math.abs(cell.y - row.yAvg) < 30) {
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

  private mapCells(
    cells: PDFExtractText[],
    fieldKeyMap: Map<number, string>,
  ): Map<string, string[]> {
    const map = new Map<string, string[]>();
    const xs = Array.from(fieldKeyMap.keys());

    if (
      cells.length === 1 &&
      this.types.some((type) => cells[0].str.toLowerCase().startsWith(type))
    ) {
      return map;
    }

    cells.forEach((cell) => {
      let bestX: number | null = null;
      let bestDiff = Infinity;

      xs.forEach((x) => {
        const diff = Math.abs(cell.x - x);

        const key = fieldKeyMap.get(x)!;
        const tol = key === 'product' ? 20 : 10;

        if (diff < tol && diff < bestDiff) {
          bestDiff = diff;
          bestX = x;
        }
      });

      if (bestX !== null) {
        const key = fieldKeyMap.get(bestX)!;
        const arr = map.get(key) ?? [];

        arr.push(cell.str);
        map.set(key, arr);
      }
    });

    return map;
  }

  private isProductCodePattern(text: string): boolean {
    return /-\s*[A-Z]+[0-9]{4,}$/.test(text);
  }

  private getRowType(
    typeMakers: { y: number; type: PdfParsingType; raw: string }[],
    yAvg: number,
  ): { type: PdfParsingType } {
    return (
      typeMakers.filter((m) => m.y <= yAvg).sort((a, b) => b.y - a.y)[0] || {
        type: 'accessory',
      }
    );
  }

  private mappingResult(
    cellMap: Map<string, string[]>,
    currentType: PdfParsingType,
  ) {
    const result: VuoriBomInterface = {
      type: currentType,
      classification: '',
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
          const match = text.match(/\b[A-Z]+\d{4,}\b/)!;

          const brandItemNo = match?.[0];
          const description = text.replace(
            new RegExp(`[-\\s]*${brandItemNo}`),
            '',
          );

          result.description = description;
          result.brandItemNo = brandItemNo;
          break;

        case 'placement':
          result.placement = text;
          break;

        case 'detailedComposition':
          result.content = text;
          break;

        case 'supplier':
          result.supplier = text;
          break;

        case 'supplierRefNo':
          result.supplierNo = text;
          break;

        case 'uom':
          result.unit = text;
          break;

        case 'weight':
          result.weight = text;
          break;

        case 'color':
          result.fabricColorName = text;
          break;
      }
    }

    return result;
  }
}
