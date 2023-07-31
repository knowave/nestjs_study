import { BadRequestException, Injectable } from "@nestjs/common";
import { User } from "../entities/user.entity";
import { DataSource, Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersRepository extends Repository<User> {
    constructor(private readonly dataSource: DataSource) {
        super(User, dataSource.createEntityManager());
    }
    
    async getUserById(id: number): Promise<User> {
        return await this.findOne({ where: { id } });
    }
    
    async getUserBYEmail(email: string): Promise<User> {
        const user = await this.findOne({ select: ["id", "email", "username"], where: { email } });
    
        return user;
    }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const { email, username, password, confirmPassword }: CreateUserDto = createUserDto;

        const createUser = this.create({
            email,
            username,
            password,
        });

        const user = await this.findOne({ where: { email } });

        if (user != null) {
            throw new BadRequestException('fail');
        }

        if (password !== confirmPassword) {
            throw new BadRequestException('Not Match password');
        }

        await bcrypt.hash(password, 12);
        return await this.save(createUser);
    }

    async deleteUser(id: number): Promise<void> {
        await this.delete(id);
    }
}