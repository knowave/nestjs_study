import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PostRepositoryModule } from './repository/post.repository.module';

@Module({
  imports: [PostRepositoryModule],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
