import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'email', unique: true })
  email: string;

  @Column({ name: 'user-name', unique: true })
  userName: string;

  @Column({ name: 'password' })
  password: string;

  @Column({ name: 'current-hashed-refresh-token', nullable: true })
  @Exclude()
  currentHashedRefreshToken?: string;
}
