import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { Product } from 'src/entities/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';

const mockRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const mockQueryRunner = {
  manager: {},
} as QueryRunner;

class MockDataSource {
  createQueryRunner(): QueryRunner {
    return mockQueryRunner;
  }
}

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('ProductsService', () => {
  Object.assign(mockQueryRunner.manager, {
    create: jest.fn(),
    save: jest.fn(),
  });

  mockQueryRunner.connect = jest.fn();
  mockQueryRunner.startTransaction = jest.fn();
  mockQueryRunner.commitTransaction = jest.fn();
  mockQueryRunner.rollbackTransaction = jest.fn();
  mockQueryRunner.release = jest.fn();

  let service: ProductsService;
  let dataSource: DataSource;
  let repository: MockRepository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: DataSource,
          useClass: MockDataSource,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<MockRepository<Product>>(
      getRepositoryToken(Product),
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
