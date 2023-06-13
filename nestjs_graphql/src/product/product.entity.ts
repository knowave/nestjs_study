import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', { name: 'title', comment: '상품 이름', length: 30 })
    title: string;

    @Column()
    price: number;
}