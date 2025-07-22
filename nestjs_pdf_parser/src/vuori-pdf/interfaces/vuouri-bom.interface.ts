import { PdfParsingType } from 'src/common/types/pdf-parsing.type';

export interface VuoriBomInterface {
  type: PdfParsingType;
  // classification: string;
  // description: string;
  // brandItemNo: string;
  // placement: string;
  // supplierNo: string;
  // supplier: string;
  // unit: string;
  // weight?: string | null;
  // content?: string | null;
  // fabricColorName?: string | null;
  product: string;
  placement: string;
  detailedComposition: string;
  supplier: string;
  supplierRefNo: string;
  uom: string;
  weight: string;
  color: string;
}
