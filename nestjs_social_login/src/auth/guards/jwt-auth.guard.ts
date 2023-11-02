import {
  BadRequestException,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AUTH_EXCEPTION, USER_EXCEPTION } from 'src/common/error/error-code';
import { UserService } from 'src/user/user.service';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtAuthGuards extends AuthGuard('jwt') {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const { authorization } = request.headers;

    if (authorization === undefined) {
      throw new BadRequestException(USER_EXCEPTION.USER_NOT_EXIST_TOKEN);
    }

    const token = authorization.replace('Bearer ', '');
    const tokenValidate = await this.validate(token);
    request.user = tokenValidate.user ? tokenValidate.user : tokenValidate;
    return true;
  }

  async validate(token: string) {
    try {
      // 토큰 검증
      const tokenVerify = await this.authService.tokenValidate(token);
      if (tokenVerify.type === 'accessToken') {
        return await this.userService.findUserById(tokenVerify.id);
      } else {
        return tokenVerify;
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
