import { Injectable, NotFoundException } from '@nestjs/common';
import { CrawlingService } from 'src/crawling/crawling.service';
import { InjectRepository } from '@nestjs/typeorm';
import { News } from './entities/news.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PaginationDto } from './dto/pagination.dto';
import { UploadService } from 'src/upload/upload.service';

@Injectable()
export class NewsService {
  constructor(
    private readonly crawlingService: CrawlingService,
    private readonly configService: ConfigService,
    @InjectRepository(News) private readonly newsRepository: Repository<News>,
  ) {}

  async createNews(): Promise<News[]> {
    const url = this.configService.get<string>('CRAWLING_URL');
    const crawlingData = await this.crawlingService.crawlDataFromWebpage(url);
    const savedNews = [];

    for (const data of crawlingData) {
      const newsEntity = this.newsRepository.create({
        title: data.title,
        category: data.category,
        image: data.image,
      });

      savedNews.push(await this.newsRepository.save(newsEntity));
    }

    return savedNews;
  }

  async getAllNews({ page, limit }: PaginationDto) {
    const news = await this.newsRepository
      .createQueryBuilder('news')
      .orderBy('news_id', 'DESC')
      .skip((page - 1) * limit)
      .limit(limit)
      .getMany();

    const totalCount = await this.newsRepository.count();
    const totalItems = await this.newsRepository.count();
    const totalPages = Math.ceil(totalItems / limit);

    return {
      items: news,
      totalCount: totalCount,
      totalItems: totalItems,
      totalPages: totalPages,
    };
  }

  async getNewsById(id: number): Promise<News> {
    const news = await this.newsRepository.findOne({ where: { id } });

    if (!news) {
      throw new NotFoundException('NOT EXIST NEWS');
    }

    return news;
  }

  async removeNews(id: number): Promise<void> {
    const news = await this.getNewsById(id);
    await this.newsRepository.delete(news.id);
  }
}
