import { Module } from '@nestjs/common';
import { CrawlingService } from './crawling.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [CrawlingService, ConfigService],
  exports: [CrawlingService],
})
export class CrawlingModule {}
