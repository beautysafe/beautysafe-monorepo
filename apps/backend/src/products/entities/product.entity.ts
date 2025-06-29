import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Brand } from '../../brands/entities/brand.entity';
import { SubSubCategory } from '../../subsubcategories/entities/subsubcategory.entity';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';
import { Flag } from '../../flags/entities/flag.entity';
import { ProductImage } from './product-image.entity';
import { Category } from 'src/categories/entities/category.entity';
import { SubCategory } from 'src/subcategories/entities/subcategory.entity';

export enum ProductType {
  ALL = 'All',
  MEN = 'Men',
  WOMEN = 'Women',
  CHILD = 'Child',
  BABY = 'Baby',
}

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  uid: number;

  @Column()
  name: string;

  @Column({ type: 'double precision', default: 0 })
  validScore: number;

  @Column({ unique: true })
  ean: string;

  @Column({ type: 'enum', enum: ProductType })
  type: ProductType;

  @ManyToOne(() => Brand, { eager: true })
  brand: Brand;

  @ManyToOne(() => Category, { eager: true, nullable: true })
  category: Category | null;

  @ManyToOne(() => SubCategory, { eager: true, nullable: true })
  subCategory: SubCategory | null;

  @ManyToOne(() => SubSubCategory, { eager: true, nullable: true })
  subSubCategory: SubSubCategory | null;

  @OneToMany(() => ProductImage, (image) => image.product, {
    cascade: true,
    eager: true,
  })
  images: ProductImage[];

  @ManyToMany(() => Ingredient, { eager: true })
  @JoinTable({ name: 'product_ingredients' })
  composition: Ingredient[];

  @ManyToMany(() => Flag, { eager: true })
  @JoinTable({ name: 'product_flags' })
  flags: Flag[];
}
