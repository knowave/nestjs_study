import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { EXIST_USER } from './error/user.error';
import { UserDto } from './repository/dto/user.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { email, name, password } = createUserDto;

    const existUser = await this.userRepository.getUserByEmail(email);
    if (existUser) throw new BadRequestException(EXIST_USER);

    const hashedPassword = await this.hashPassword(password);
    const user = await this.userRepository.save({
      email,
      name,
      password: hashedPassword,
    });

    delete user['password'];
    return user;
  }

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, process.env.SALT_ROUNDS);
  }

  async user(userId: number): Promise<UserDto> {
    const user = await this.userRepository.getUserById(userId);
    return user;
  }
}
