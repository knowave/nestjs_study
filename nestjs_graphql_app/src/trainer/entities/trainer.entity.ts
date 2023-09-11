import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Feed } from 'src/feed/entities/feed.entity';
import { Follow } from 'src/follow/entities/follow.entity';
import { Gym } from 'src/gym/entities/gym.entity';
import { Like } from 'src/like/entities/like.entity';
import { Reply } from 'src/reply/entities/reply.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';

@InputType('trainerInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Trainer extends BaseEntity {
  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  name?: string;

  @Field(() => Number, { nullable: true })
  @Column({ nullable: true })
  rating?: number;

  @Field(() => Boolean, { nullable: true })
  @Column({ nullable: true })
  blocked?: boolean;

  @Field(() => User, { nullable: true })
  @OneToOne(() => User, {
    nullable: true,
    onDelete: 'CASCADE',
    cascade: ['soft-remove'],
  })
  @JoinColumn()
  user?: User;

  @Field(() => [Gym], { nullable: true })
  @OneToMany(() => Gym, (gym) => gym.trainer, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
    cascade: ['soft-remove'],
  })
  gyms?: Gym[];

  @Field(() => [Feed], { nullable: true })
  @OneToMany(() => Feed, (feed) => feed.trainer, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
    cascade: ['soft-remove'],
  })
  feeds?: Feed[];

  @Field(() => [Follow], { nullable: true })
  @OneToMany(() => Follow, (follow) => follow.trainer, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
    cascade: ['soft-remove'],
  })
  follows?: Follow[];

  @Field(() => [Like], { nullable: true })
  @OneToMany(() => Like, (like) => like.trainer, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
    cascade: ['soft-remove'],
  })
  likes?: Like[];

  @Field(() => [Reply], { nullable: true })
  @OneToMany(() => Reply, (reply) => reply.trainer, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
    cascade: ['soft-remove'],
  })
  replies?: Reply[];
}
