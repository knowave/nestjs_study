import { Test, TestingModule } from '@nestjs/testing';
import { CatsService } from './cats.service';
import { Cats } from './entities/cats.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

class MockRepository {
  async findOneByid(id: number) {
    const cats: Cats = new Cats();
    cats.catsId = id;
    return cats;
  }
}

describe('CatsService', () => {
  let service: CatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatsService,
        {
          provide: getRepositoryToken(Cats),
          useClass: MockRepository,
        },
      ],
    }).compile();

    service = module.get<CatsService>(CatsService);
  });

  describe('findOneById', () => {
    it('should return one cat who was id in input param', async () => {
      const catsId: number = 1;
      const result = await service.findOneById(catsId);
      expect(result.catsId).toBe(catsId);
    });
    it.todo('should return InternelServberException when input catsId is 1');
  });
});
