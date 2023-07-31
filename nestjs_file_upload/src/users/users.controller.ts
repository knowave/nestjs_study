import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'src/entities/user.entity';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Get(":userId")
    async getUserById(@Param('userId') id: number): Promise<User> {
        return await this.usersService.getuserById(id);
    }
}