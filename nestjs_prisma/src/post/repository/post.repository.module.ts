import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PostRepository } from './post.repository';

@Module({
  imports: [PrismaModule],
  providers: [PostRepository],
  exports: [PostRepository],
})
export class PostRepositoryModule {}
