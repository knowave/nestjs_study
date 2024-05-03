import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(createUserDto: CreateUserDto): Promise<User> {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async getUserByIdForValidate(id: number): Promise<User> {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async getUserById(id: number): Promise<UserDto> {
    return this.prisma.user.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        refreshToken: true,
        password: false,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getUserByEmail(email: string): Promise<User> {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async softDelete(id: number): Promise<User> {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
