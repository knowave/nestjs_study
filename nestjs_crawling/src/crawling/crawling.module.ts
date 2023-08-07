import { Module } from '@nestjs/common';
import { CrawlingService } from './crawling.service';
import { CrawlingController } from './crawling.controller';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [CrawlingService, ConfigService],
  controllers: [CrawlingController],
})
export class CrawlingModule {}
