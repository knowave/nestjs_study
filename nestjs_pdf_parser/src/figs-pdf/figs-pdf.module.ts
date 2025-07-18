import { Module } from '@nestjs/common';
import { FigsPdfService } from './figs-pdf.service';
import { FigsPdfController } from './figs-pdf.controller';

@Module({
  controllers: [FigsPdfController],
  providers: [FigsPdfService],
})
export class FigsPdfModule {}
