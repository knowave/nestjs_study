import { PDFExtractText } from 'pdf.js-extract';

export interface Row {
  cells: PDFExtractText[];
  yAvg: number;
}
