import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(
    @Body() { email, firstName, secondName }: CreateUserDto,
  ): Promise<UserResponseDto> {
    return await this.usersService.createUser({
      email,
      firstName,
      secondName,
    });
  }

  @Get('/:id')
  async getUserById(@Param() id: number): Promise<UserResponseDto> {
    return await this.usersService.getUserById(id);
  }
}
