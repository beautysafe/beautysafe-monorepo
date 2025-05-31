import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { SubCategory } from '../../subcategories/entities/subcategory.entity';

@Entity()
export class SubSubCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => SubCategory, (subcategory) => subcategory.subsubcategories, { eager: true, onDelete: 'CASCADE' })
  subcategory: SubCategory;
}
