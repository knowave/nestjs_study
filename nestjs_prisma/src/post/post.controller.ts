import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Public } from 'src/auth/decorators/is-public.decorator';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return await this.postService.createPost(createPostDto, user.id);
  }

  @Patch('/:id')
  async updatePost(
    @Body() updatePostDto: UpdatePostDto,
    @Param('id') id: number,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return await this.postService.updatePost(updatePostDto, id, user.id);
  }

  @Get()
  @Public()
  async publishedPosts(
    @Query('page') page: number,
    @Query('take') take: number,
  ) {
    return await this.postService.publishedPosts(+page, +take);
  }

  @Get('/non-published/:id')
  async nonPublishedPost(@Param('id') id: number, @CurrentUser() user: User) {
    return this.postService.nonPublishedPost(+id, user.id);
  }

  @Get('/non-published')
  async nonPublishedPosts(
    @Query('page') page: number,
    @Query('take') take: number,
    @CurrentUser() user: User,
  ) {
    return this.postService.nonPublishedPosts({
      page: +page,
      take: +take,
      authorId: user.id,
    });
  }

  @Get('/published/:id')
  @Public()
  async post(@Param('id') id: number) {
    return this.postService.post(+id);
  }
}
