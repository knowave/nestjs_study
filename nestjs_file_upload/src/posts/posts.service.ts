import { Injectable, NotFoundException } from '@nestjs/common';
import { UploadService } from '../upload/upload.service';
import { UsersService } from '../users/users.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsRepository } from './posts.repository';
import { Post } from '../entities/post.entity';
import { User } from '../entities/user.entity';
import { MyPaginationQuery } from '../base/pagination-query';
import { MyPagination } from '../base/pagination-response';
import { PostListResponseDto } from './dto/post-list-response.dto';
import { paginate } from 'nestjs-typeorm-paginate';

@Injectable()
export class PostsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly uploadService: UploadService,
    private readonly postsRepository: PostsRepository,
  ) {}

  async getAllByPosts(
    options: MyPaginationQuery,
  ): Promise<MyPagination<PostListResponseDto>> {
    const query = await this.postsRepository
      .createQueryBuilder('post')
      .innerJoinAndSelect('post.user', 'user');

    const result = await paginate(query, options);

    const data = result.items.map((item) => {
      const dto = new PostListResponseDto(item);
      dto.email = item.user.email;
      dto.username = item.user.username;
      return dto;
    });

    return new MyPagination<PostListResponseDto>(data, result.meta);
  }

  async getPostById(user: User, id: number): Promise<Post> {
    const existUser = await this.usersService.getuserById(user.id);

    if (!existUser) {
      throw new NotFoundException('Not Found User');
    }

    if (!id) {
      throw new NotFoundException('Not Exist Post ID');
    }

    return await this.postsRepository.getPostById(user, id);
  }

  async createPost(
    userId: number,
    { title, description, status, image }: CreatePostDto,
  ): Promise<Post> {
    const imageUrl = await this.uploadService.uploadImages(image);
    const user = await this.usersService.getuserById(userId);

    if (!user) {
      throw new NotFoundException('Not Found User');
    }

    const post = this.postsRepository.create({
      title,
      description,
      status,
      image: imageUrl,
      user: user,
    });

    return await this.postsRepository.save(post);
  }

  async deleteById(id: number): Promise<void> {
    if (!id) {
      throw new NotFoundException('Not Exist Post Id');
    }

    return await this.postsRepository.deleteById(id);
  }
}
