import { Module } from '@nestjs/common';
import { VuoriPdfModule } from './vuori-pdf/vuori-pdf.module';
import { FigsPdfModule } from './figs-pdf/figs-pdf.module';

@Module({
  imports: [VuoriPdfModule, FigsPdfModule],
})
export class AppModule {}
