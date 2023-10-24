import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private readonly dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async createUser({ username }: CreateUserDto): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = await this.findOne({ where: { username } });

      if (user) {
        throw new BadRequestException('이미 존재하는 사용자입니다.');
      }

      const createUser = queryRunner.manager.create(User, { username });
      const savedUser = await queryRunner.manager.save(createUser);
      await queryRunner.commitTransaction();
      return savedUser;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new Error(err);
    } finally {
      await queryRunner.release();
    }
  }

  async getUserById(userId: number): Promise<User> {
    try {
      const existUser = await this.findOne({ where: { id: userId } });

      if (!existUser) {
        throw new NotFoundException('존재하지 않는 사용자입니다.');
      }

      return existUser;
    } catch (err) {
      throw new Error(err);
    }
  }
}
