import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { USER_EXCEPTION } from 'src/common/error/error-code';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, hashedPassword: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) throw new NotFoundException(USER_EXCEPTION.NOT_FOUND_USER);

    const password = await bcrypt.compare(hashedPassword, user.password);

    if (password) {
      const { password, ...result } = user;
      return result;
    }
  }

  async validateGoogle(googleId: string): Promise<User> {
    const googleUser = await this.userRepository.findOne({
      where: { googleAccount: googleId },
    });

    if (!googleUser) throw new NotFoundException(USER_EXCEPTION.NOT_FOUND_USER);

    return googleUser;
  }

  async validateKakao(kakaoId: string): Promise<User> {
    const kakaoUser = await this.userRepository.findOne({
      where: { kakaoAccount: kakaoId },
    });

    if (!kakaoUser) throw new NotFoundException(USER_EXCEPTION.NOT_FOUND_USER);

    return kakaoUser;
  }

  async validateNaver(naverId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { naverAccount: naverId },
    });

    if (!user) throw new NotFoundException(USER_EXCEPTION.NOT_FOUND_USER);

    return user;
  }

  async tokenValidate(token: string) {
    return await this.jwtService.verify(token, {
      secret: this.configService.get('JWT_SECRET'),
    });
  }
}
