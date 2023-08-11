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

export class CoreEntity {
  @PrimaryGeneratedColumn()
  @IsNumber()
  id: number;

  @CreateDateColumn()
  @IsDate()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date;

  @DeleteDateColumn()
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
