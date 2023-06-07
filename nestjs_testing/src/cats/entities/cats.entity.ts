import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cats')
export class Cats {
  @PrimaryGeneratedColumn({ name: 'cat_id', comment: '고양이 고유값' })
  catsId: number;

  @Column('varchar', { name: 'name', comment: '고양이 이름' })
  name: string;
}
