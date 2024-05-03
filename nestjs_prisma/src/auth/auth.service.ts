import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from 'src/user/repository/user.repository';
import * as bcrypt from 'bcrypt';
import { AUTH_FAIL_VALIDATE } from './error/auth.error';

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async validateUser(userId: number, plainTextPassword: string) {
    const user = await this.userRepository.getUserByIdForValidate(userId);
    await this.verifyPassword(plainTextPassword, user.password);
    const { password, ...result } = user;
    return result;
  }

  private async verifyPassword(password: string, hashedPassword: string) {
    const isPasswordMatch = await bcrypt.compare(password, hashedPassword);
    if (!isPasswordMatch) {
      throw new BadRequestException(AUTH_FAIL_VALIDATE);
    }
  }
}
