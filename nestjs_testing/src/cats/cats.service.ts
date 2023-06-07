import { Injectable, NotFoundException } from '@nestjs/common';
import { CatsRepository } from './cats.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { MyPaginationQuery } from '../base/pagination-query';
import { Pagination, paginate } from 'nestjs-typeorm-paginate';
import { Cats } from './entities/cats.entity';
import { CATS_EXCEPTION } from '../exceptions/error-code';
import { CreateCatDto } from './dto/create-cat.dto';

@Injectable()
export class CatsService {
  constructor(
    @InjectRepository(CatsRepository) private catsRepository: CatsRepository,
  ) {}

  /**
   * 고양이 전체 조회
   * @param options
   * @returns
   */
  async findAllByCats(options: MyPaginationQuery): Promise<Pagination<Cats>> {
    return paginate(await this.catsRepository, options);
  }

  /**
   * 특정 고양이 조회
   * @param catsId
   * @returns
   */
  async findOneById(catsId: number): Promise<Cats> {
    const cat = await this.catsRepository.findOneById(catsId);

    if (!cat) {
      throw new NotFoundException(CATS_EXCEPTION.CAT_NOT_FOUND);
    }

    return cat;
  }

  /**
   * 고양이 생성
   * @param createCatDto
   * @returns
   */
  async createCat(createCatDto: CreateCatDto): Promise<Cats> {
    return await this.catsRepository.createCat(createCatDto);
  }

  /**
   * 고양이 수정
   * @param catsId
   * @returns
   */
  async update(catsId: number, cats: Cats): Promise<Cats> {
    const cat = await this.findOneById(catsId);

    cat.name = cats.name;

    return await this.catsRepository.saveCat(cat);
  }

  /**
   * 고양이 삭제
   * @param catsId
   * @returns
   */
  async delete(catsId: number): Promise<void> {
    const cat = await this.findOneById(catsId);

    await this.catsRepository.delete(cat.catsId);
  }
}
