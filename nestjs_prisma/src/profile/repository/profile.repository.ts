import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getProfileByUserId(userId: number) {
    return this.prisma.profile.findUnique({
      where: {
        userId,
      },
      include: {
        user: {
          include: {
            posts: true,
          },
        },
      },
    });
  }

  async save(data: any) {
    return this.prisma.profile.create({
      data,
    });
  }
}
