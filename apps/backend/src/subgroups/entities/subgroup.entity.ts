import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Group } from '../../groups/entities/group.entity';
import { Journey } from '../../journeys/entities/journey.entity';
import { ProductList } from '../../product-lists/entities/product-list.entity';

@Entity('subgroups')
export class SubGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageKey?: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Group, (group) => group.subgroups, {
    eager: true,
    onDelete: 'CASCADE',
  })
  group: Group;

  @OneToMany(() => ProductList, (productList) => productList.subgroup)
  productLists: ProductList[];

  @OneToMany(() => Journey, (journey) => journey.subgroup)
  journeys: Journey[];
}
