import { ObjectType, Field } from '@nestjs/graphql';
import { IsDate, IsNumber } from 'class-validator';
import {
  BeforeInsert,
  BeforeRemove,
  BeforeSoftRemove,
  BeforeUpdate,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { getKoreaTimeByDate } from '../constant/common.functions';

@ObjectType()
export class BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Number)
  @IsNumber()
  id: number;

  @CreateDateColumn()
  @Field(() => Date)
  @IsDate()
  createdAt: Date;

  @UpdateDateColumn()
  @Field(() => Date)
  @IsDate()
  updatedAt: Date;

  @DeleteDateColumn()
  @Field(() => Date)
  @IsDate()
  deletedAt: Date;

  @BeforeInsert()
  protected beforeInsert() {
    this.createdAt = new Date(getKoreaTimeByDate());
    this.updatedAt = new Date(getKoreaTimeByDate());
  }

  @BeforeUpdate()
  protected beforeUpdate() {
    this.updatedAt = new Date(getKoreaTimeByDate());
  }

  @BeforeSoftRemove()
  protected beforeSoftRemove() {
    this.deletedAt = new Date(getKoreaTimeByDate());
  }

  @BeforeRemove()
  protected beforeRemove() {
    this.deletedAt = new Date(getKoreaTimeByDate());
  }
}
