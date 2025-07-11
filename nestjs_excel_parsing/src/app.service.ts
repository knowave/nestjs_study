import { Injectable, Logger } from '@nestjs/common';
import { Workbook } from 'exceljs';

@Injectable()
export class AppService {
  private logger: Logger;
  private workbook: Workbook;

  constructor() {
    this.workbook = new Workbook();
    this.logger = new Logger(AppService.name);
  }

  async excelFileUpload(file: Express.Multer.File) {
    const result: Record<string, any>[] = [];

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

      const data: Record<string, any> = {};

      headers.forEach((header, idx) => {
        data[header] = row.getCell(idx + 1).value;
      });

      result.push(data);
    }

    return result;
  }
}
