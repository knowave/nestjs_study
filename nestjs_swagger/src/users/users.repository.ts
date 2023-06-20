import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/users.entity';
import { createUserDto } from './dto/create-user.dto';
import { updateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(private readonly dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async getAllByUsers(): Promise<User[]> {
    const users = await this.find();

    if (users.length === 0) {
      throw new NotFoundException();
    }

    return;
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async createUser(createUserDto: createUserDto): Promise<User> {
    const { firstName, lastName } = createUserDto;

    const saveUser = await this.create({ firstName, lastName });

    return await this.save(saveUser);
  }

  async updateUser(id: number, updateUserDto: updateUserDto): Promise<User> {
    const { firstName, lastName } = updateUserDto;
    const user = await this.getUserById(id);

    user.firstName = firstName;
    user.lastName = lastName;

    return await this.save(user);
  }

  async deleteUser(id: number): Promise<void> {
    const result = await this.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException();
    }
  }
}
