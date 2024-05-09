import { Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUsers() {
    return await this.userService.createUsers();
  }

  @Get()
  async getTopTenUsers() {
    return await this.userService.getTopTenUsers();
  }

  @Get('top-ten-users-without-cache')
  async getTopTenUsersWithoutCache() {
    return await this.userService.getTopTenUsersWithoutCache();
  }
}
