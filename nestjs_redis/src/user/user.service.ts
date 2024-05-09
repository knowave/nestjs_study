import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './entities/user.entity';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async createUsers() {
    const createUsers: User[] = [];

    for (let i = 0; i < 10000; i++) {
      createUsers.push(
        new User({
          username: `user${i}`,
          followCount: Math.floor(Math.random() * 1000),
        }),
      );
    }

    return await this.userRepository.bulkSave(createUsers);
  }

  async getTopTenUsers() {
    const topTenUsers = await this.redis.get('topTenUsers');

    if (topTenUsers) {
      return JSON.parse(topTenUsers);
    }

    const users =
      await this.userRepository.findTopTenUsersAndSortByFollowCount();
    await this.redis.set('topTenUsers', JSON.stringify(users), 'EX', 60);

    return users;
  }

  async getTopTenUsersWithoutCache() {
    return await this.userRepository.findTopTenUsersAndSortByFollowCount();
  }
}
