import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from 'src/user/user.service';
import { AuthService } from '../auth.service';
import { AUTH_EXCEPTION, USER_EXCEPTION } from 'src/common/error/error-code';
import * as CryptoJS from 'crypto-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh-token') {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const { authorization } = request.headers;

    if (authorization === undefined)
      throw new BadRequestException(
        USER_EXCEPTION.USER_NOT_EXIST_REFRESH_TOKEN,
      );

    const refreshToken = authorization.replace('Bearer ', '');
    const refreshTokenValidate = await this.validate(refreshToken);
    request.user = refreshTokenValidate;
    return true;
  }

  async validate(refreshToken: string) {
    try {
      const bytes = CryptoJS.AES.decrypt(
        refreshToken,
        this.configService.get('AES_KEY'),
      );
      const token = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      const tokenVerify = await this.authService.tokenValidate(token);
      const user = await this.userService.findUserById(tokenVerify.id);

      if (user.jwtToken === refreshToken) {
        return user;
      } else {
        throw new ForbiddenException(AUTH_EXCEPTION.PERMISSION_DENIED);
      }
    } catch (err) {
      switch (err.message) {
        case 'invalid token':
          throw new BadRequestException(AUTH_EXCEPTION.INVALID_TOKEN);
        case 'invalid signature':
          throw new BadRequestException(AUTH_EXCEPTION.INVALID_TOKEN);
        case 'jwt expired':
          throw new BadRequestException(AUTH_EXCEPTION.JWT_EXPIRED);

        default:
          throw new InternalServerErrorException(`서버 오류 발생 ${err}`);
      }
    }
  }
}
