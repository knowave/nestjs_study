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
  createQueryRunner(mode?: 'master' | 'slave'): QueryRunner {
    return mockQueryRunner;
  }
}

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('ProductsService', () => {
  let service: ProductsService;
  let dataSource: DataSource;
  let productRepository: MockRepository<Product>;
  let usersRepository: MockRepository<User>;
  let user = new User();

  beforeEach(async () => {
    Object.assign(mockQueryRunner.manager, {
      create: jest.fn(),
      save: jest.fn(),
    });

    mockQueryRunner.connect = jest.fn();
    mockQueryRunner.startTransaction = jest.fn();
    mockQueryRunner.commitTransaction = jest.fn();
    mockQueryRunner.rollbackTransaction = jest.fn();
    mockQueryRunner.release = jest.fn();

    user.id = 1;
    user.email = 'test@example.com';
    user.firstName = 'John';
    user.secondName = 'Doe';

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
    dataSource = module.get<DataSource>(DataSource);

    productRepository = module.get<MockRepository<Product>>(
      getRepositoryToken(Product),
    );
    usersRepository = module.get<MockRepository<User>>(
      getRepositoryToken(User),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('CreateProduct', () => {
    const mockedProduct = {
      name: 'Test Product.',
      description: 'Test Product Description',
    };
    it('상품 생성 성공', async () => {
      const queryRunner = dataSource.createQueryRunner();
      usersRepository.findOne.mockResolvedValue(user.id);

      jest
        .spyOn(queryRunner.manager, 'save')
        .mockResolvedValueOnce(mockedProduct);

      const result = await service.createProduct(mockedProduct, user);

      expect(queryRunner.connect).toHaveBeenCalledTimes(1);
      expect(queryRunner.startTransaction).toHaveBeenCalledTimes(1);
      expect(queryRunner.commitTransaction).toHaveBeenCalledTimes(1);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(0);
      expect(queryRunner.release).toHaveBeenCalledTimes(1);

      expect(result).toEqual({ ok: true });
    });

    it('userId가 없으면 생성 실패', async () => {
      const queryRunner = dataSource.createQueryRunner();
      usersRepository.findOne.mockResolvedValue(undefined);

      jest
        .spyOn(queryRunner.manager, 'save')
        .mockResolvedValueOnce(mockedProduct);

      const result = await service.createProduct(mockedProduct, user);

      expect(queryRunner.connect).toHaveBeenCalledTimes(1);
      expect(queryRunner.startTransaction).toHaveBeenCalledTimes(1);
      expect(queryRunner.commitTransaction).toHaveBeenCalledTimes(0);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(0);
      expect(queryRunner.release).toHaveBeenCalledTimes(1);

      expect(result).toEqual({ ok: false, error: '존재하는 유저가 없습니다.' });
    });

    it('생성하고자 하는 상품의 데이터가 없을 때 Transaction은 Rollback이 되어서 생성 실패가 되어야한다.', async () => {
      const queryRunner = dataSource.createQueryRunner();
      usersRepository.findOne.mockResolvedValue(user.id);

      jest.spyOn(queryRunner.manager, 'save').mockResolvedValueOnce({});

      const result = await service.createProduct(
        {
          name: undefined,
          description: undefined,
        },
        user,
      );

      console.log(result);
    });
  });
});
