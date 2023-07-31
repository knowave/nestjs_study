import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Post } from "./post.entity";
import * as bcrypt from "bcrypt";

@Entity('user')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column()
    username: string;

    @Column()
    password: string;

    @Column()
    refreshToken: string;

    @OneToMany(() => Post, (post) => post.user)
    posts: Post[]

    async hashPassword(password: string): Promise<void> {
        this.password = await bcrypt.hash(password, 12);
    }
}