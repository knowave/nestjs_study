import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Feed } from 'src/feed/entities/feed.entity';
import { Trainer } from 'src/trainer/entities/trainer.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

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
}
