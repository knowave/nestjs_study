import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { UsersService } from '../users/users.service';
import { UploadService } from '../upload/upload.service';
import { PostsRepository } from './posts.repository';

@Module({
  imports: [UsersService, UploadService],
  providers: [PostsService, PostsRepository],
  controllers: [PostsController],
})
export class PostsModule {}
