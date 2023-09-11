import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Feed } from 'src/feed/entities/feed.entity';
import { Gym } from 'src/gym/entities/gym.entity';
import { Trainer } from 'src/trainer/entities/trainer.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  username?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  password?: string;

  @Field(() => Boolean, { nullable: true })
  @Column({ nullable: true })
  blocked?: boolean;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  jwtToken?: string;

  @OneToOne(() => Trainer, {
    nullable: true,
    onDelete: 'CASCADE',
    cascade: ['soft-remove'],
  })
  @JoinColumn()
  trainer?: Trainer;

  @Field(() => [Feed], { nullable: true })
  @OneToMany(() => Feed, (feed) => feed.user, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
    cascade: ['soft-remove'],
  })
  feeds?: Feed[];

  @Field(() => [Gym], { nullable: true })
  @OneToMany(() => Gym, (gym) => gym.user, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
    cascade: ['soft-remove'],
  })
  gyms?: Gym[];
}
