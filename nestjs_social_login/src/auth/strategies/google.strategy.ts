import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import 'dotenv/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: 'http://localhost:3000/user/auth/google/callback',
      scope: ['email'],
    });
  }

  async validate(profile: any) {
    const googleId = profile.id;
    const user = await this.authService.validateGoogle(googleId);

    if (user === null) return { googleId, type: 'googleId' };

    return { user, type: 'login' };
  }
}
