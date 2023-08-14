import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class User extends CoreEntity {
  @Column()
  email: string;

  @Column()
  firstName: string;

  @Column()
  secondName: string;

  @OneToMany(() => Product, (product) => product.user, {
    nullable: true,
  })
  products?: Product[];
}
