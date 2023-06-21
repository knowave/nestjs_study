import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import { createUserDto } from './dto/create-user.dto';
import { updateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersRepository) private usersRepository: UsersRepository,
  ) {}

  async getAllByusers(): Promise<User[]> {
    return await this.usersRepository.getAllByUsers();
  }

  async getUserById(id: number): Promise<User> {
    return await this.usersRepository.getUserById(id);
  }

  async createUser(createUser: createUserDto): Promise<User> {
    return await this.usersRepository.createUser(createUser);
  }

  async updateUser(id: number, updateUserDto: updateUserDto): Promise<User> {
    return await this.usersRepository.updateUser(id, updateUserDto);
  }

  async deleteUser(id: number): Promise<void> {
    return await this.usersRepository.deleteUser(id);
  }
}
