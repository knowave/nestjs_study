import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PostRepositoryModule } from './repository/post.repository.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [PostRepositoryModule, UserModule],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
