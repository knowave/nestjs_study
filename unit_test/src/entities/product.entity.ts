import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Product extends CoreEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToOne(() => User, (user) => user.products, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: false,
  })
  user?: User;
}
