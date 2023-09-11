import { ObjectType, Field, Int, InputType } from '@nestjs/graphql';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Gym } from 'src/gym/entities/gym.entity';
import { Trainer } from 'src/trainer/entities/trainer.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, ManyToOne } from 'typeorm';

@InputType('followInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Follow extends BaseEntity {
  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.follows, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
    cascade: ['soft-remove'],
  })
  user?: User;

  @Field(() => Gym, { nullable: true })
  @ManyToOne(() => Gym, (gym) => gym.follows, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
    cascade: ['soft-remove'],
  })
  gym?: Gym;

  @Field(() => Trainer, { nullable: true })
  @ManyToOne(() => Trainer, (trainer) => trainer.follows, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
    cascade: ['soft-remove'],
  })
  trainer?: Trainer;
}
