import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Query,
  Post as RePost,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { MyPaginationQuery } from '../base/pagination-query';
import { Pagination } from 'nestjs-typeorm-paginate';
import { PostListResponseDto } from './dto/post-list-response.dto';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { Post } from '../entities/post.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Get()
  async getAllByPosts(
    @Query() query: MyPaginationQuery,
  ): Promise<Pagination<PostListResponseDto>> {
    return await this.postsService.getAllByPosts(query);
  }

  @Get(':id')
  async getPostById(
    @CurrentUser() user: User,
    @Param() id: number,
  ): Promise<Post> {
    return await this.postsService.getPostById(user, id);
  }

  @RePost()
  @UseInterceptors(FilesInterceptor('files'))
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() images: Express.MulterS3.File[],
    @CurrentUser() user: User,
  ): Promise<Post> {
    if (images.length > 10) {
      throw new BadRequestException(
        'Invalid number of images. You must upload at least 1 image and up to 10 images.',
      );
    }

    if (images.length > 0) {
      createPostDto.image = images;
    }

    return this.postsService.createPost(user.id, createPostDto);
  }
}
