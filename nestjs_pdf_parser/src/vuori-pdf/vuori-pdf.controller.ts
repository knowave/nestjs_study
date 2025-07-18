import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { VuoriPdfService } from './vuori-pdf.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('vuori-pdf')
export class VuoriPdfController {
  constructor(private readonly vuoriPdfService: VuoriPdfService) {}

  @UseInterceptors(FileInterceptor('file'))
  @Post('/parse')
  async parse(@UploadedFile() file: Express.Multer.File) {
    return this.vuoriPdfService.parse(file);
  }
}
