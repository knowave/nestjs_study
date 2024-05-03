import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { PostService } from './post.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

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
}
