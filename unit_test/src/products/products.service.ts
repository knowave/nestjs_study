import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { User } from 'src/entities/user.entity';

@Injectable()
export class ProductsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async createProduct(
    { name, description }: CreateProductDto,
    user: User,
  ): Promise<ProductResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const existUser = await this.usersRepository.findOne({
        where: { id: user.id },
      });

      if (!existUser) {
        return { ok: false, error: '존재하는 유저가 없습니다.' };
      }

      await queryRunner.manager.save(Product, {
        name,
        description,
        ...existUser,
      });
      await queryRunner.commitTransaction();
      return { ok: true };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getProductById(id: number): Promise<ProductResponseDto> {
    const found = await this.productRepository.findOne({
      relations: ['user'],
      where: { id },
    });

    if (!found) {
      return { ok: false, error: '존재하는 상품이 없습니다.' };
    }

    return { ok: true };
  }
}
