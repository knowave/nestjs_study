import { Injectable } from '@nestjs/common';
import { CreatePostDto } from '../dto/create-post.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdatePostDto } from '../dto/update-post.dto';

@Injectable()
export class PostRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(createPostDto: CreatePostDto, authorId: number) {
    return this.prisma.post.create({
      data: {
        ...createPostDto,
        authorId,
      },
    });
  }

  async update(updatePostDto: UpdatePostDto, id: number, authorId: number) {
    return this.prisma.post.update({
      where: { id, authorId },
      data: updatePostDto,
    });
  }
}
