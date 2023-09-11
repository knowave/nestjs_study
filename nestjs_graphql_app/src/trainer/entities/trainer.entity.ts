import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Feed } from 'src/feed/entities/feed.entity';
import { Gym } from 'src/gym/entities/gym.entity';
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
}
