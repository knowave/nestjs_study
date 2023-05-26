import { Body, Controller, Get, Post } from '@nestjs/common';
import { CatService } from './cat.service';
import { createCatDto } from './dto/create-cat.dto';
import { Cat } from './schemas/cat.schema';

@Controller('cat')
export class CatController {
  constructor(private readonly catService: CatService) {}

  @Post()
  async create(@Body() createCatDto: createCatDto): Promise<Cat> {
    return await this.catService.create(createCatDto);
  }

  @Get()
  async findAll(): Promise<Cat[]> {
    return await this.catService.findAll();
  }
}
