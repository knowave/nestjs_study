import { Body, Controller, Post } from '@nestjs/common';
import { PostService } from './post.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { CreatePostDto } from './dto/create-post.dto';

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
}
