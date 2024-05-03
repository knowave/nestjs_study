import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from 'src/user/repository/user.repository';
import * as bcrypt from 'bcrypt';
import { AUTH_FAIL_VALIDATE } from './error/auth.error';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/sign-in.dto';
import { NOT_FOUND_USER } from 'src/user/error/user.error';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(userId: number, plainTextPassword: string) {
    const user = await this.userRepository.getUserByIdForValidate(userId);
    await this.verifyPassword(plainTextPassword, user.password);
    const { password, ...result } = user;
    return result;
  }

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;
    const user = await this.userRepository.getUserByEmail(email);
    if (!user) throw new NotFoundException(NOT_FOUND_USER);

    const result = await this.validateUser(user.id, password);
    if (!result) throw new BadRequestException(AUTH_FAIL_VALIDATE);

    const accessToken = this.createAccessToken(user.id);
    const refreshToken = this.createRefreshToken(user.id);

    await this.userService.setCurrentRefreshToken(refreshToken, user.id);

    return { accessToken, refreshToken };
  }

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

  private async verifyPassword(password: string, hashedPassword: string) {
    const isPasswordMatch = await bcrypt.compare(password, hashedPassword);
    if (!isPasswordMatch) throw new BadRequestException(AUTH_FAIL_VALIDATE);
  }
}
