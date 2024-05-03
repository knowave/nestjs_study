import { Body, Controller, Post } from '@nestjs/common';
import { User } from '@prisma/client';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginResponseDto } from './dto/login-response.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.createUser(createUserDto);
  }

  @Post('signin')
  async signIn(@CurrentUser() user: User): Promise<LoginResponseDto> {
    const accessToken = this.authService.createAccessToken(user.id);
    const refreshToken = this.authService.createRefreshToken(user.id);

    await this.userService.setCurrentRefreshToken(refreshToken, user.id);

    return { accessToken, refreshToken };
  }
}
