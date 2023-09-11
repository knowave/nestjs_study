import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Feed } from 'src/feed/entities/feed.entity';
import { Follow } from 'src/follow/entities/follow.entity';
import { Like } from 'src/like/entities/like.entity';
import { Reply } from 'src/reply/entities/reply.entity';
import { Trainer } from 'src/trainer/entities/trainer.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@InputType('gymInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Gym extends BaseEntity {
  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  gymInfo?: string;

  @Field(() => Number, { nullable: true })
  @Column('int', { nullable: true })
  rating?: number;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  location?: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.gyms, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
    cascade: ['soft-remove'],
  })
  user?: User;

  @Field(() => Trainer, { nullable: true })
  @ManyToOne(() => Trainer, (trainer) => trainer.gyms, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
    cascade: ['soft-remove'],
  })
  trainer?: Trainer;

  @Field(() => Feed, { nullable: true })
  @ManyToOne(() => Feed, (feed) => feed.gyms, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
    cascade: ['soft-remove'],
  })
  feed?: Feed;

  @Field(() => [Follow], { nullable: true })
  @OneToMany(() => Follow, (follow) => follow.gym, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
    cascade: ['soft-remove'],
  })
  follows?: Follow[];

  @Field(() => [Like], { nullable: true })
  @OneToMany(() => Like, (like) => like.gym, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
    cascade: ['soft-remove'],
  })
  likes?: Like[];

  @Field(() => [Reply], { nullable: true })
  @OneToMany(() => Reply, (reply) => reply.gym, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
    cascade: ['soft-remove'],
  })
  replies?: Reply[];
}
