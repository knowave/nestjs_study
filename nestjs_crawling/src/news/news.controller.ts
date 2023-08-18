import { Controller, Get, Post, Param, Delete, Query } from '@nestjs/common';
import { NewsService } from './news.service';
import { PaginationDto } from './dto/pagination.dto';
import { News } from './entities/news.entity';
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  async createNews(): Promise<News[]> {
    return await this.newsService.createNews();
  }

  @Get()
  async getAllNews(@Query() { page, limit }: PaginationDto) {
    return await this.newsService.getAllNews({ page, limit });
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<News> {
    return await this.newsService.getNewsById(id);
  }

  @Delete(':id')
  async removeNews(@Param('id') id: string): Promise<void> {
    return await this.newsService.removeNews(+id);
  }
}
