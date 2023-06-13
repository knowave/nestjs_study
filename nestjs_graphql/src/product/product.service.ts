import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Repository } from 'typeorm';
import { ProductDto } from './dto/product.dto';

@Injectable()
export class ProductService {
    constructor(@InjectRepository(Product) private readonly productRepository: Repository<Product>) {}

    async createProduct(product: ProductDto): Promise<Product> {
        const create = this.productRepository.create(product);

        return await this.productRepository.save(create);
    }

    async findAllProducts(): Promise<Product[]> {
        return await this.productRepository.find();
    }
}
