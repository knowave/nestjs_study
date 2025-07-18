import { Module } from '@nestjs/common';
import { VuoriPdfService } from './vuori-pdf.service';
import { VuoriPdfController } from './vuori-pdf.controller';

@Module({
  controllers: [VuoriPdfController],
  providers: [VuoriPdfService],
})
export class VuoriPdfModule {}
