import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private readonly dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async saveUser(user: User): Promise<User> {
    return await this.save(user);
  }

  async bulkSave(users: User[]): Promise<User[]> {
    return await this.save(users);
  }

  async findTopTenUsersAndSortByFollowCount(): Promise<User[]> {
    return await this.createQueryBuilder('user')
      .orderBy('user.followCount', 'DESC')
      .limit(10)
      .getMany();
  }
}
