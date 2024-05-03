import { Injectable } from '@nestjs/common';
import { CreatePostDto } from '../dto/create-post.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdatePostDto } from '../dto/update-post.dto';

@Injectable()
export class PostRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(createPostDto: CreatePostDto, authorId: number) {
    return await this.prisma.post.create({
      data: {
        ...createPostDto,
        authorId,
      },
    });
  }

  async update(updatePostDto: UpdatePostDto, id: number, authorId: number) {
    return await this.prisma.post.update({
      where: { id, authorId },
      data: updatePostDto,
    });
  }

  async getPublishedPosts(page: number, take: number) {
    const count = await this.prisma.post.count({ where: { published: true } });
    const posts = await this.prisma.post.findMany({
      where: { published: true },
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
      take,
      skip: (page - 1) * take,
    });

    return { posts, count };
  }

  async getPostByIdAndAuthorIdAndPublishedFalse(id: number, authorId: number) {
    return await this.prisma.post.findUnique({
      where: { id, published: false, authorId },
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
    });
  }

  async getPublishedPostById(id: number) {
    return await this.prisma.post.findUnique({
      where: { id, published: true },
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
    });
  }
}
