import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { News } from './entities/news.entity';
import { CrawlingModule } from 'src/crawling/crawling.module';
import { CrawlingService } from 'src/crawling/crawling.service';

@Module({
  imports: [TypeOrmModule.forFeature([News]), CrawlingModule],
  providers: [NewsService, CrawlingService],
  controllers: [NewsController],
})
export class NewsModule {}
