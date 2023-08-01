import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostsRepository } from './posts.repository';
import { UsersModule } from '../users/users.module';
import { UploadModule } from '../upload/upload.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../entities/post.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    UsersModule, 
    UploadModule,
  ],
  providers: [PostsService, PostsRepository],
  controllers: [PostsController],
})
export class PostsModule {}
