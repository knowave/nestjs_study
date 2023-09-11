import { ObjectType, Field, Int, InputType } from '@nestjs/graphql';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Feed } from 'src/feed/entities/feed.entity';
import { Gym } from 'src/gym/entities/gym.entity';
import { Trainer } from 'src/trainer/entities/trainer.entity';
import { Entity, ManyToOne } from 'typeorm';

@InputType('likeInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Like extends BaseEntity {
  @Field(() => Feed, { nullable: true })
  @ManyToOne(() => Feed, (feed) => feed.likes, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
    cascade: ['soft-remove'],
  })
  feed?: Feed;

  @Field(() => Gym, { nullable: true })
  @ManyToOne(() => Gym, (gym) => gym.likes, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
    cascade: ['soft-remove'],
  })
  gym?: Gym;

  @Field(() => Trainer, { nullable: true })
  @ManyToOne(() => Trainer, (trainer) => trainer.likes, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
    cascade: ['soft-remove'],
  })
  trainer?: Trainer;
}
