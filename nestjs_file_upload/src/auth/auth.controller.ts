import { Body, Controller, Delete, Param, Patch, Post, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/entities/user.entity';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { LoginResponseDto } from './dto/login-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('auth')
export class AuthController {
    constructor (
        private authService: AuthService,
        private usersService: UsersService,
    ) {}

    @Post('/sign-up')
    async signUp(@Body(ValidationPipe) createUserDto: CreateUserDto): Promise<User> {
        return await this.usersService.createUser(createUserDto);
    }

    @Post('/sign-in')
    async signIn(@CurrentUser() user: User): Promise<LoginResponseDto> {
        const accessToken = this.authService.createAcessToken(user.id);
        const refreshToken = this.authService.createRefreshToken(user.id);

        await this.usersService.setCurrentRefreshToken(refreshToken, user.id);

        return { accessToken, refreshToken };
    }

    @Post('/sign-out')
    async signOut(@CurrentUser() user: User): Promise<void> {
        await this.usersService.removeRefreshToken(user.id);
    }

    @Post('/refresh-token')
    async refreshToken(@CurrentUser() user: User): Promise<string> {
        const accessToken = await this.authService.createAcessToken(user.id);

        return accessToken;
    }

    @Patch('/:userId')
    async updateUser(@Param('userId') id: number, @Body() updateUserDto: UpdateUserDto): Promise<User> {
        const { username, password }: UpdateUserDto = updateUserDto;

        return await this.usersService.updateUser(id, username, password);
    }

    @Delete(':/userId')
    async deleteUser(@Param('userId') id: number): Promise<void> {
        return await this.usersService.deleteUser(id);
    }
}
