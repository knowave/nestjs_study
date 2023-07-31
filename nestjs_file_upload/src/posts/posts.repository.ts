import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class PostsRepository extends Repository<Post> {
  constructor(private readonly dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async getPostById(user: User, id: number): Promise<Post> {
    return await this.findOne({ where: { id, user: { id: user.id } } });
  }

  async deleteById(id: number): Promise<void> {
    await this.delete(id);
  }
}
