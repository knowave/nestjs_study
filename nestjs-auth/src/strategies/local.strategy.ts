import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../models/auth/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  // 인증 전략 구현
  async validate(email: string, password: string): Promise<any> {
    const user = this.authService.validateUser(email, password);

    // 유저가 일치하지 않으면
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
