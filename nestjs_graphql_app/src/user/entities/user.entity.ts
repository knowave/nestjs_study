import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Post } from 'src/post/entities/post.entity';
import { Column, Entity, OneToMany } from 'typeorm';

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

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  jwtToken?: string;

  @Field(() => [Post], { nullable: true })
  @OneToMany(() => Post, (post) => post.user, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
    cascade: ['soft-remove'],
  })
  posts?: Post[];
}
