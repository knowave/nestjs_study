import { Injectable } from '@nestjs/common';
import { CreateUserInput, CreateUserOutput } from './dto/create-user.dto';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import 'dotenv';
import { GetUserByIdInput, GetUserByIdOutput } from './dto/get-user-by-id.dto';
import { EditUserInput, EditUserOutput } from './dto/edit-user.dto';
import { DeleteUserInput, DeleteUserOutput } from './dto/delete-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async createUser({
    email,
    username,
    password,
  }: CreateUserInput): Promise<CreateUserOutput> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existUserWithEmail = await this.userRepository.findOne({
        where: { email },
      });

      if (existUserWithEmail) {
        return { ok: false, error: '다른 이메일로 시도해주세요.' };
      }

      let hashedPassword: string;

      if (password) {
        hashedPassword = await bcrypt.hash(password, +process.env.BCRYPT_SALT);
      }

      const createUser = queryRunner.manager.create(User, {
        email,
        username,
        password: password ? hashedPassword : null,
      });

      await queryRunner.manager.save(createUser);
      await queryRunner.commitTransaction();
      return { ok: true };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getUserById({ userId }: GetUserByIdInput): Promise<GetUserByIdOutput> {
    try {
      const user = await this.userRepository.findOne({
        relations: ['feeds', 'gyms', 'follows'],
        where: { id: userId },
      });

      if (!user) {
        return { ok: false, error: '존재하지 않는 사용자입니다.' };
      }

      return { ok: true, user };
    } catch (err) {
      throw err;
    }
  }

  async editUser({
    id,
    password,
    ...editUserInput
  }: EditUserInput): Promise<EditUserOutput> {
    try {
      let hashedPassword: string;
      const user = await this.userRepository.findOne({
        where: { id: id },
      });

      if (!user) {
        return { ok: false, error: '존재하지 않는 사용자입니다.' };
      }

      if (password) {
        hashedPassword = await bcrypt.hash(password, +process.env.BCRYPT_SALT);
      }

      await this.userRepository.save({
        ...user,
        ...editUserInput,
        password: password ? hashedPassword : user.password,
      });
      return { ok: true };
    } catch (err) {
      throw err;
    }
  }

  async deleteUser({ userId }: DeleteUserInput): Promise<DeleteUserOutput> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        return { ok: false, error: '존재하지 않는 사용자입니다.' };
      }

      await queryRunner.manager.softRemove(User, user);
      await queryRunner.commitTransaction();
      return { ok: true };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    }
  }
}
