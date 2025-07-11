import { Injectable, Logger } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { PurchaseOrderParsingType } from './types/purchase-order-parsing.type';

@Injectable()
export class AppService {
  private logger: Logger;
  private workbook: Workbook;

  constructor() {
    this.workbook = new Workbook();
    this.logger = new Logger(AppService.name);
  }

  async excelFileUpload(file: Express.Multer.File) {
    const result: PurchaseOrderParsingType[] = [];

    const workbook = await this.workbook.xlsx.load(file.buffer as Buffer);
    const sheet = workbook.getWorksheet('Vendor View');

    if (!sheet) {
      this.logger.error(`Sheet not found ${file.originalname}`);
      return;
    }

    const headerRow = sheet.getRow(5).values as string[];
    const headers = headerRow.slice(1);

    for (let rowNum = 6; rowNum <= sheet.rowCount; rowNum++) {
      const row = sheet.getRow(rowNum);

      const isEmpty =
        !Array.isArray(row.values) ||
        row.values.every((value) => value === null || value === undefined);

      if (isEmpty) continue;

      const data: PurchaseOrderParsingType = {};

      headers.forEach((header, idx) => {
        switch (header.toLowerCase()) {
          case 'season code':
            const seasonCode = row.getCell(idx + 1).value as string;

            const year = seasonCode.substring(0, 2);
            const season = seasonCode.substring(2);

            data.year = year;
            data.season = season;
            break;

          case 'warehouse name':
            const warehouseName = row.getCell(idx + 1).value as string;

            const destination = warehouseName.split(' ')[0];
            const warehouse = warehouseName.split(' ')[1];

            data.destination = destination;
            data.wareHouse = warehouse;
            break;

          case 'purchase order no':
            const purchaseOrderNo = row.getCell(idx + 1).value as string;

            data.purchaseOrderNo = purchaseOrderNo;
            break;

          case 'gender':
            const gender = row.getCell(idx + 1).value as string;

            data.gender = gender;
            break;

          case 'item':
            const styleNo = row.getCell(idx + 1).value as string;

            data.styleNo = styleNo;
            break;

          case 'product name':
            const styleDescription = row.getCell(idx + 1).value as string;

            data.styleDescription = styleDescription;
            break;

          case 'color':
            const colorCode = row.getCell(idx + 1).value as string;

            data.colorCode = colorCode;
            break;

          case 'color description':
            const colorName = row.getCell(idx + 1).value as string;

            data.colorName = colorName;
            break;

          case 'size':
            const size = row.getCell(idx + 1).value as string;

            data.size = size;
            break;

          case 'quantity|n':
            const quantity = row.getCell(idx + 1).value as number;

            data.quantity = quantity;
            break;

          case 'delivery terms|n':
            const termOfPrice = row.getCell(idx + 1).value as string;

            data.termOfPrice = termOfPrice;
            break;

          case 'mode of delivery|n':
            const shipMode = row.getCell(idx + 1).value as string;

            data.shipMode = shipMode;
            break;

          case 'requested delivery date|n':
            const inDc = row.getCell(idx + 1).value as Date;

            data.inDc = inDc;
            break;

          default:
            let unitPrice: number | undefined = undefined;
            let etd: Date;
            let exFactory: Date;

            // unit price
            const ddpHeader = 'ddp price $';
            const fobHeader = 'fob price $';

            // etd, exFactory
            const confirmedEtdHeader = 'confirmed etd|n';
            const requestedEtdHeader = 'requested etd|n';

            if (header.toLowerCase() === fobHeader) {
              const ddpIndex = headers.findIndex(
                (h) => h.toLowerCase() === ddpHeader,
              );

              const ddpPrice = row.getCell(ddpIndex + 1).value as number;
              const fobPrice = row.getCell(idx + 1).value as number;

              if (ddpPrice != null && ddpPrice > 0) {
                unitPrice = ddpPrice;
              } else if (
                fobPrice != null &&
                fobPrice > 0 &&
                (!ddpPrice || ddpPrice === 0)
              ) {
                unitPrice = fobPrice;
              } else {
                unitPrice = 0;
              }

              data.unitPrice = unitPrice;
            }

            if (header.toLowerCase() === requestedEtdHeader) {
              const confirmedEtdIndex = headers.findIndex(
                (h) => h.toLowerCase() === confirmedEtdHeader,
              );

              const confirmedEtd = row.getCell(confirmedEtdIndex + 1)
                .value as Date;

              const requestedEtd = row.getCell(idx + 1).value as Date;

              if (confirmedEtd) {
                etd = confirmedEtd;
                exFactory = confirmedEtd;
              } else {
                etd = requestedEtd;
                exFactory = requestedEtd;
              }

              data.etd = etd;
              data.exFactory = exFactory;
            }

            break;
        }
      });

      result.push(data);
    }

    return result;
  }
}
