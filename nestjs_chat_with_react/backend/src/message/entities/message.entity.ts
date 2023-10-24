import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  content?: string;

  @Column({ default: false, nullable: true })
  read?: boolean;

  @CreateDateColumn()
  sentAt: Date;

  @ManyToOne(() => User, (user) => user.sentMessages, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  sender?: User;

  @ManyToOne(() => User, (user) => user.receivedMessage, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  receiver?: User;
}
