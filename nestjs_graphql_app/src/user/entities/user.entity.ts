import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Feed } from 'src/feed/entities/feed.entity';
import { Follow } from 'src/follow/entities/follow.entity';
import { Gym } from 'src/gym/entities/gym.entity';
import { Trainer } from 'src/trainer/entities/trainer.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => String, { nullable: true })
  @IsEmail({}, { message: '잘못된 이메일 형식입니다.' })
  @Column({ nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @Column({ nullable: true })
  username?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @Length(8, 20, { message: '비밀번호는 최소 8에서 최대 20자이어야 합니다.' })
  @Matches(/^(?=.*[!@#$%^&*])/gm, {
    message: '비밀번호에는 특수문자 최소 1개가 포함되어야 합니다.',
  })
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

  @Field(() => [Follow], { nullable: true })
  @OneToMany(() => Follow, (follow) => follow.user, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
    cascade: ['soft-remove'],
  })
  follows?: Follow[];
}
