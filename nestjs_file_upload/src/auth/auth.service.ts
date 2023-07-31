import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { compare } from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) {}

    async validateUser(id: number, plainTextPassword: string) {
        const user = await this.usersService.getuserById(id);
        await this.verifyPassword(plainTextPassword, user.password);
        const { password, ...result } = user;
        
        return result;
    }

    private async verifyPassword(password: string, hashedPassword: string) {
        const isPasswordMatch = await compare(password, hashedPassword);

        if (!isPasswordMatch) {
          throw new BadRequestException('PASSWORD NOT MATCH');
        }
      }

  createAcessToken(id: number) {
    const payload = { id };

    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
      )}`,
    });
  }


  createRefreshToken(id: number) {
    const payload = { id };
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
      )}`,
    });
  }
}