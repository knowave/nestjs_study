import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async createUser({
    email,
    firstName,
    secondName,
  }: CreateUserDto): Promise<UserResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const createUser = queryRunner.manager.create(User, {
        email,
        firstName,
        secondName,
      });

      const user = await this.usersRepository.findOne({
        where: { email },
      });

      if (user !== null) {
        return { ok: false, error: '이미 존재하는 유저가 있습니다.' };
      }

      await queryRunner.manager.save(User, createUser);
      await queryRunner.commitTransaction();
      return { ok: true };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getUserById(id: number): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      relations: ['product'],
      where: { id },
    });

    if (!user) {
      return { ok: false, error: '존재하지 않는 유저입니다.' };
    }

    return { ok: true };
  }
}
