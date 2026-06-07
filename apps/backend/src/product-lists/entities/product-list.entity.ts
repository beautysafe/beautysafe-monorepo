import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { SubGroup } from '../../subgroups/entities/subgroup.entity';

@Entity('product_lists')
export class ProductList {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => SubGroup, (subgroup) => subgroup.productLists, {
    eager: true,
    onDelete: 'CASCADE',
  })
  subgroup: SubGroup;

  @ManyToMany(() => Product)
  @JoinTable({
    name: 'product_list_products',
    joinColumn: { name: 'productListId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'productUid', referencedColumnName: 'uid' },
  })
  products: Product[];
}
