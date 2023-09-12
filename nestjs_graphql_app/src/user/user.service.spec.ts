import { DataSource, QueryRunner, Repository } from 'typeorm';
import { UserService } from './user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { createConnection } from 'mysql2';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.dto';

const mockRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  softRemove: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserService', () => {
  let userService: UserService;
  let userRepository: MockRepository<User>;
  let dataSource: DataSource;

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
      softRemove: jest.fn(),
    });

    mockQueryRunner.connect = jest.fn();
    mockQueryRunner.startTransaction = jest.fn();
    mockQueryRunner.commitTransaction = jest.fn();
    mockQueryRunner.rollbackTransaction = jest.fn();
    mockQueryRunner.release = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
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

    userService = module.get<UserService>(UserService);
    userRepository = module.get<MockRepository<User>>(getRepositoryToken(User));
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('CreateUser', () => {
    it('유저 생성 성공 시 transaction commit을 할 것이고, rollback은 하지 않는다.', async () => {
      const mockCreateUser: CreateUserInput = {
        email: 'test@test.com',
        username: 'tester',
        password: 'test1234@',
      };

      const queryRunner = dataSource.createQueryRunner();

      jest
        .spyOn(queryRunner.manager, 'create')
        .mockReturnValue([mockCreateUser]);
      jest.spyOn(queryRunner.manager, 'save').mockResolvedValue(mockCreateUser);

      const result = await userService.createUser(mockCreateUser);

      expect(queryRunner.manager.save).toHaveBeenCalledTimes(1);
      expect(queryRunner.connect).toHaveBeenCalledTimes(1);
      expect(queryRunner.startTransaction).toHaveBeenCalledTimes(1);
      expect(queryRunner.commitTransaction).toHaveBeenCalledTimes(1);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(0);
      expect(queryRunner.release).toHaveBeenCalledTimes(1);

      expect(result).toEqual({ ok: true });
    });

    it('유저 생성 시 이미 존재하는 email로 생성 시도 시 error message 발생', async () => {
      userRepository.findOne.mockResolvedValue('test@test.com');

      const mockCreateUser: CreateUserInput = {
        email: 'test@test.com',
        username: 'tester',
        password: 'test1234',
      };
      const queryRunner = dataSource.createQueryRunner();

      jest
        .spyOn(queryRunner.manager, 'create')
        .mockReturnValue([mockCreateUser]);
      jest.spyOn(queryRunner.manager, 'save').mockResolvedValue(mockCreateUser);

      const result = await userService.createUser(mockCreateUser);

      expect(queryRunner.manager.save).toHaveBeenCalledTimes(0);
      expect(queryRunner.connect).toHaveBeenCalledTimes(1);
      expect(queryRunner.startTransaction).toHaveBeenCalledTimes(1);
      expect(queryRunner.commitTransaction).toHaveBeenCalledTimes(0);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(0);
      expect(queryRunner.release).toHaveBeenCalledTimes(1);

      expect(result).toEqual({
        ok: false,
        error: '다른 이메일로 시도해주세요.',
      });
    });
  });

  describe('getUserById', () => {
    it('유저가 존재하면 true를 반환한다.', async () => {
      const mockUser = {
        id: 1,
        username: 'tester',
      };

      userRepository.findOne.mockResolvedValue(mockUser);
      const result = await userService.getUserById({ userId: 1 });
      expect(result).toEqual({ ok: true, user: { id: 1, username: 'tester' } });
    });

    it('유저가 존재하지 않으면 false와 함께 error message를 반환한다.', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const result = await userService.getUserById({ userId: 1 });
      expect(result).toEqual({
        ok: false,
        error: '존재하지 않는 사용자입니다.',
      });
    });
  });
});
