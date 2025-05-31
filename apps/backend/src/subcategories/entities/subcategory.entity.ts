import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { SubSubCategory } from '../../subsubcategories/entities/subsubcategory.entity';

@Entity()
export class SubCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Category, (category) => category.subcategories, { eager: true, onDelete: 'CASCADE' })
  category: Category;

  @OneToMany(() => SubSubCategory, (subsubcategory) => subsubcategory.subcategory)
  subsubcategories: SubSubCategory[];
}
