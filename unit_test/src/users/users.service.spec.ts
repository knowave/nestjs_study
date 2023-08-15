import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { createConnection } from 'mysql2';

const mockRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UsersService', () => {
  let service: UsersService;
  let dataSource: DataSource;
  let repository: MockRepository<User>;

  const mockQueryRunner = {
    manager: {},
  } as QueryRunner;

  class MockDataSource {
    createQueryRunner(mode?: 'master' | 'slave'): QueryRunner {
      return mockQueryRunner;
    }
  }

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DataSource,
          useClass: MockDataSource,
        },
        {
          provide: createConnection,
          useValue: jest.fn(),
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<MockRepository<User>>(getRepositoryToken(User));
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('CreateUser', () => {
    it('유저 생성 성공', async () => {
      const createUser: CreateUserDto = {
        email: 'tester@gmail.com',
        firstName: 'kim',
        secondName: 'tester',
      };
      const queryRunner = dataSource.createQueryRunner();

      repository.findOne.mockResolvedValue(null);

      jest.spyOn(queryRunner.manager, 'create').mockReturnValue([createUser]);
      jest.spyOn(queryRunner.manager, 'save').mockResolvedValueOnce(createUser);

      const result = await service.createUser(createUser);
      expect(queryRunner.manager.save).toHaveBeenCalledWith(User, [createUser]);
      expect(result).toEqual({ ok: true });
    });

    it('이미 존재하는 이메일이 있으면 실패', async () => {
      const existUser: CreateUserDto = {
        email: 'exist@example.com',
        firstName: 'kim',
        secondName: 'min-jae',
      };

      const queryRunner = dataSource.createQueryRunner();

      repository.findOne.mockResolvedValue(existUser.email);

      jest.spyOn(queryRunner.manager, 'create').mockReturnValue([existUser]);
      jest.spyOn(queryRunner.manager, 'save').mockResolvedValue(existUser);

      const result = await service.createUser(existUser);
      expect(result).toEqual({
        ok: false,
        error: '이미 존재하는 유저가 있습니다.',
      });
    });
  });
});
