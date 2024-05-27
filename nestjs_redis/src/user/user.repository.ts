import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async save(user: User): Promise<User> {
    return await this.repository.save(user);
  }

  async bulkSave(users: User[]): Promise<User[]> {
    return await this.repository.save(users);
  }

  async findTopTenUsersAndSortByFollowCount(): Promise<User[]> {
    return await this.repository
      .createQueryBuilder('user')
      .orderBy('user.followCount', 'DESC')
      .addOrderBy('user.username', 'ASC')
      .limit(10)
      .getMany();
  }
}
