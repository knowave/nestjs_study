export class BomAccessoryMockDto {
  private _classification: string;
  private _description: string;
  private _brandItemNo: string;
  private _placement: string;
  private _supplierNo: string;
  private _supplier: string;
  private _unit: string;
  private _accessoryColorName: string;

  constructor(
    classification: string,
    description: string,
    brandItemNo: string,
    placement: string,
    supplierNo: string,
    supplier: string,
    unit: string,
    accessoryColorName: string,
  ) {
    this._classification = classification;
    this._description = description;
    this._brandItemNo = brandItemNo;
    this._placement = placement;
    this._supplierNo = supplierNo;
    this._supplier = supplier;
    this._unit = unit;
    this._accessoryColorName = accessoryColorName;
  }
}
