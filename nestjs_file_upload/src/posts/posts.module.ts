import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { UsersService } from 'src/users/users.service';
import { UploadService } from 'src/upload/upload.service';

@Module({
  imports: [UsersService, UploadService],
  providers: [PostsService],
  controllers: [PostsController],
})
export class PostsModule {}
