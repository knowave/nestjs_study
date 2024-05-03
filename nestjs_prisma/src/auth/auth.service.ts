import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from 'src/user/repository/user.repository';
import * as bcrypt from 'bcrypt';
import { AUTH_FAIL_VALIDATE } from './error/auth.error';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  createAccessToken(userId: number) {
    const payload = { userId };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
    });
  }

  createRefreshToken(userId: number) {
    const payload = { userId };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
    });
  }

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
