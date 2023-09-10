import { ObjectType, Field, Int, InputType } from '@nestjs/graphql';
import { IsEnum } from 'class-validator';
import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

export enum PostStatus {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

@InputType('postInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  description?: string;

  @Column({ enum: PostStatus, type: 'enum' })
  @Field(() => PostStatus)
  @IsEnum(PostStatus)
  status: PostStatus;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.posts, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
    cascade: ['soft-remove'],
  })
  user?: User;
}
