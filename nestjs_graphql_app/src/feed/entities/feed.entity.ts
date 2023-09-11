import { ObjectType, Field, Int, InputType } from '@nestjs/graphql';
import { IsEnum } from 'class-validator';
import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

export enum FeedStatus {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

@InputType('feedInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Feed extends BaseEntity {
  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  description?: string;

  @Column({ enum: FeedStatus, type: 'enum' })
  @Field(() => FeedStatus)
  @IsEnum(FeedStatus)
  status: FeedStatus;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.feeds, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
    cascade: ['soft-remove'],
  })
  user?: User;
}
