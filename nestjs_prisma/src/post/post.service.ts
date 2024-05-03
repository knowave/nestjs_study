import { Injectable, NotFoundException } from '@nestjs/common';
import { PostRepository } from './repository/post.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UserService } from 'src/user/user.service';
import { NOT_FOUND_USER } from 'src/user/error/user.error';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly userService: UserService,
  ) {}

  async createPost(
    createPostDto: CreatePostDto,
    authorId: number,
  ): Promise<boolean> {
    const user = await this.userService.user(authorId);

    if (!user) throw new NotFoundException(NOT_FOUND_USER);

    await this.postRepository.save(createPostDto, authorId);

    return true;
  }

  async updatePost(
    updatePostDto: UpdatePostDto,
    id: number,
    authorId: number,
  ): Promise<boolean> {
    const user = await this.userService.user(authorId);

    if (!user) throw new NotFoundException(NOT_FOUND_USER);

    await this.postRepository.update(updatePostDto, +id, authorId);

    return true;
  }
}
