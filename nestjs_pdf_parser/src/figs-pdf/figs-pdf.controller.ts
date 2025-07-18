import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FigsPdfService } from './figs-pdf.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('figs-pdf')
export class FigsPdfController {
  constructor(private readonly figsPdfService: FigsPdfService) {}

  @UseInterceptors(FileInterceptor('file'))
  @Post('/parse')
  async parse(@UploadedFile() file: Express.Multer.File) {
    return this.figsPdfService.parse(file);
  }
}
