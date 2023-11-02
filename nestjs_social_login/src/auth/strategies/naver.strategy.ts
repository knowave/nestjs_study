import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-naver';
import { AuthService } from '../auth.service';
import 'dotenv/config';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/user/auth/naver/callback',
    });
  }

  async validate(profile: any) {
    const naverId = profile.id;
    const user = await this.authService.validateNaver(naverId);

    if (user === null) return { naverId, type: 'naver' };

    return { user, tyep: 'login' };
  }
}
