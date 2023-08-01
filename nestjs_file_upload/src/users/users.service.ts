import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor(private readonly usersRepository: UsersRepository) {}

    async getuserById(id: number): Promise<User> {
        if (!id) {
            throw new NotFoundException('NOT FOUND USER');
        }

        return await this.usersRepository.getUserById(id);
    }

    async getUserByEmail(email: string): Promise<User> {
        if (!email) {
            throw new NotFoundException('NOT FOUND USER');
        }

        return await this.usersRepository.getUserBYEmail(email);
    }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        return await this.createUser(createUserDto);
    }

    async getUserRefreshTokenMatches(refreshToken: string, id: number) {
        const user = await this.getuserById(id);

        if (refreshToken === user.refreshToken) {
            return user;
        } else {
            throw new BadRequestException('NOT MATCH REFRESHTOKEN');
        }
    }

    async setCurrentRefreshToken(refreshToken: string, id: number) {
        return await this.usersRepository.update(id, { refreshToken });
    }

    async removeRefreshToken(id: number) {
        return await this.usersRepository.update(id, { refreshToken: null });
    }

    async updateUser(
        id: number,
        username: string,
        plainPassword: string,
    ): Promise<User> {
        const user = await this.getuserById(id);

        if (username) {
            user.username = username;
        }

        if (plainPassword) {
            user.password = plainPassword;
        }

        return await this.usersRepository.save(user);
    }

    async deleteUser(id: number): Promise<void> {
        if (!id) {
            throw new NotFoundException('NOT FOUND USER');
        }

        return await this.usersRepository.deleteUser(id);
    }
}
