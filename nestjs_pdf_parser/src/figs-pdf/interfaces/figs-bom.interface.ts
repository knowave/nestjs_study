import { PdfParsingType } from 'src/common/types/pdf-parsing.type';

export interface FigsBomInterface {
  type: PdfParsingType;
  product: string;
  accClassification?: string | null;
  composition: string;
  size?: string;
  qty?: number | null;
  placement: string;
  supplierQuote: string;
  supplierCode?: string | null;
  blackBlk: string;
  navyNvy: string;
  warmBrownBr132: string;
}
