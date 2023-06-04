import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Cats } from './entities/cats.entity';

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
  async createCat(createCatDto: createCatDto): Promise<Cats> {
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
}
