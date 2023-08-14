import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { GetUser } from 'src/decorators/user.decorator';
import { User } from 'src/entities/user.entity';
import { ProductResponseDto } from './dto/product-response.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async createProduct(
    @Body() { name, description }: CreateProductDto,
    @GetUser() user: User,
  ): Promise<ProductResponseDto> {
    return await this.productsService.createProduct(
      {
        name,
        description,
      },
      user,
    );
  }

  @Get('/:id')
  async getProductById(@Param() id: number): Promise<ProductResponseDto> {
    return await this.productsService.getProductById(id);
  }
}
