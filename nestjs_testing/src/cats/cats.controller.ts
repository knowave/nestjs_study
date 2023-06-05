import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CatsService } from './cats.service';
import { MyPaginationQuery } from 'src/base/pagination-query';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Cats } from './entities/cats.entity';
import { CreateCatDto } from './dto/create-cat.dto';

@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @Get('')
  async findAllByCats(
    @Query() options: MyPaginationQuery,
  ): Promise<Pagination<Cats>> {
    return await this.catsService.findAllByCats(options);
  }

  @Get(':catsId')
  async findOneById(@Param('catsId') catsId: number): Promise<Cats> {
    return await this.catsService.findOneById(catsId);
  }

  @Post('')
  async createCat(@Body() createCatDto: CreateCatDto): Promise<Cats> {
    return await this.catsService.createCat(createCatDto);
  }

  @Patch(':catsId')
  async update(
    @Param('catsId') catsId: number,
    @Body() cats: Cats,
  ): Promise<Cats> {
    return await this.catsService.update(catsId, cats);
  }

  @Delete(':catsId')
  async delete(@Param('catsId') catsId: number): Promise<void> {
    return await this.catsService.delete(catsId);
  }
}
