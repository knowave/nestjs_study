import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JWT_EXCEPTION, USER_EXCEPTION } from 'src/common/error/error-code';
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

  async createOnceToken(socialType: string, socialId: string) {
    const payload = {
      type: socialType,
      id: socialId,
    };

    return await this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '15m',
    });
  }

  async createAccessToken(user: User): Promise<string> {
    const payload = {
      type: 'accessToken',
      id: user.id,
      nickname: user.nickname,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '15m',
    });

    return accessToken;
  }

  async createRefreshToken(user: User) {
    const payload = {
      type: 'refreshToken',
      id: user.id,
      nickname: user.nickname,
    };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('AES_KEY'),
      expiresIn: '15m',
    });

    const tokenVerify = await this.tokenValidate(token);
    const tokenExp = new Date(tokenVerify['exp'] * 1000);

    const refreshToken = CryptoJS.AES.encrypt(
      JSON.stringify(token),
      this.configService.get('AES_KEY'),
    ).toString();

    const existUser = await this.userRepository.findOne({
      where: { id: user.id },
    });

    user.jwtToken = refreshToken;
    await this.userRepository.save(existUser);
    return { refreshToken, tokenExp };
  }

  async reissueRefreshToken(user: User) {
    const existUser = await this.userRepository.findOne({
      where: { id: user.id },
    });

    if (!existUser) throw new NotFoundException(USER_EXCEPTION.NOT_FOUND_USER);

    const payload = {
      id: user.id,
      nickname: user.nickname,
      type: 'refreshToken',
    };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '20700m',
    });

    const tokenVerify = await this.tokenValidate(token);
    const tokenExp = new Date(tokenVerify['exp'] * 1000);
    const current = new Date();
    const timeRemaining = Math.floor(
      (tokenExp.getTime() - current.getTime()) / 1000 / 60 / 60,
    );

    if (timeRemaining > 10)
      throw new BadRequestException(JWT_EXCEPTION.JWT_NOT_REISSUED);

    const accessToken = await this.createAccessToken(user);
    const refreshToken = CryptoJS.AES.encrypt(
      JSON.stringify(token),
      this.configService.get('AES_KEY'),
    ).toString();

    existUser.jwtToken = refreshToken;
    await this.userRepository.save(existUser);
    return { accessToken, refreshToken: { refreshToken, tokenExp } };
  }

  async tokenValidate(token: string) {
    return await this.jwtService.verify(token, {
      secret: this.configService.get('JWT_SECRET'),
    });
  }
}
