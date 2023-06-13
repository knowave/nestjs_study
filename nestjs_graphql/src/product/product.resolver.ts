import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProductService } from './product.service';
import { ProductDto } from './dto/product.dto';
import { Product } from './product.entity';
import { InputProduct } from './product.input';

@Resolver('product')
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  @Query(() => [ProductDto])
  async findAllProducts(): Promise<Product[]> {
    return await this.productService.findAllProducts();
  }

  @Mutation(() => ProductDto)
  async createProduct(
    @Args('product') product: InputProduct,
  ): Promise<Product> {
    return await this.productService.createProduct(product);
  }
}
