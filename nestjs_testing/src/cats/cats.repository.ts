import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Cats } from './entities/cats.entity';
import { CreateCatDto } from './dto/create-cat.dto';

@Injectable()
export class CatsRepository extends Repository<Cats> {
  constructor(private readonly dataSource: DataSource) {
    super(Cats, dataSource.createEntityManager());
  }

  /**
   * 고양이 생성
   * @param createCatDto
   * @returns
   */
  async createCat(createCatDto: CreateCatDto): Promise<Cats> {
    const { name } = createCatDto;
    const createCat = await this.create({ name });

    return await this.save(createCat);
  }

  /**
   * 특정 고양이 조회
   * @param catsId
   * @returns
   */
  async findOneById(catsId: number): Promise<Cats> {
    const cat = await this.findOne({ where: { catsId } });

    return cat;
  }

  /**
   * 수정 시 사용할 method
   * @param cats
   * @returns
   */
  async updateCat(cats: Cats): Promise<Cats> {
    return await this.save(cats);
  }

  /**
   * 고양이 삭제
   * @param catsId 
   */
  async deleteCat(catsId: number): Promise<void> {
    await this.delete(catsId);
  }
}
