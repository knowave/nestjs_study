import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('post')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  status: string;

  @Column('longtext', {
    nullable: true,
  })
  image?: string[] | null;

  @ManyToMany(() => User, (user) => user.posts)
  user: User;
}
