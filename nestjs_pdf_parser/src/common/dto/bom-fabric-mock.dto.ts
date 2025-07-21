export class BomFabricMockDto {
  private _description: string;
  private _brandItemNo: string;
  private _placement: string;
  private _supplierNo: string;
  private _supplier: string;
  private _content: string;
  private _weight: string;
  private _unit: string;
  private _fabricColorName: string;

  constructor(
    description: string,
    brandItemNo: string,
    placement: string,
    supplierNo: string,
    supplier: string,
    content: string,
    weight: string,
    unit: string,
    fabricColorName: string,
  ) {
    this._description = description;
    this._brandItemNo = brandItemNo;
    this._placement = placement;
    this._supplierNo = supplierNo;
    this._supplier = supplier;
    this._content = content;
    this._weight = weight;
    this._unit = unit;
    this._fabricColorName = fabricColorName;
  }
}
