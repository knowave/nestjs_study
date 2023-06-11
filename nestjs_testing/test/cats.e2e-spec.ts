import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { CatsRepository } from '../src/cats/cats.repository';
import { CatsService } from '../src/cats/cats.service';
import { DatabaseModule } from '../src/database/database.module';
import { DataSource } from 'typeorm';
import { RequestHelper } from '../utils/test.utils';
import { CatsFatory } from './factory/cats.fatory';
import { CATS_EXCEPTION } from '../src/exceptions/error-code';

describe('Cats', () => {
  let app: INestApplication;
  let catsRepository: CatsRepository;
  let catsService: CatsService;
  let catsFactory: CatsFatory;

  let requestHelper: RequestHelper;
  let dataSource: DataSource;

  let cats;
  let catsId: number | undefined;
  let token;

  const domain = '/cats';

  beforeAll(async () => {
    const modules: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [DatabaseModule, CatsRepository, CatsService, CatsFatory],
    }).compile();

    app = modules.createNestApplication();
    catsRepository = modules.get<CatsRepository>(CatsRepository);
    catsService = modules.get<CatsService>(CatsService);
    catsFactory = modules.get<CatsFatory>(CatsFatory);
    dataSource = modules.get<DataSource>(DataSource);
    requestHelper = new RequestHelper(app, token);
    cats = await catsFactory.createCat();

    await dataSource.synchronize(true);
    await app.init();
  });

  afterAll(async () => {
    await catsRepository.clear();
    await app.close();
  });

  describe('고양이 전체 조회', () => {
    it('성공', async () => {
      await catsFactory.createBaseCats();

      const response = await requestHelper.get(`${domain}?page=1&limit=10`);

      const items = response.body.items;
      const meta = response.body.meta;

      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(items).not.toBeNull();
      expect(meta.totalItems).toBe(11);
      expect(meta.totalPages).toBe(2);
    });
  });

  describe('특정 고양이 조회', () => {
    it('성공', async () => {
      catsId = 1;

      const response = await requestHelper.get(`${domain}/${catsId}`);

      const body = response.body;
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(body.catsId).toBe(catsId);
    });

    it('catsId가 존재하지 않으면 실패', async () => {
      const response = await requestHelper.get(`${domain}/123`);
      
      const body = response.body;
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(body.code).toBe(CATS_EXCEPTION.CAT_NOT_FOUND.code);
      expect(body.message).toBe(CATS_EXCEPTION.CAT_NOT_FOUND.message);
    });
  });
});
