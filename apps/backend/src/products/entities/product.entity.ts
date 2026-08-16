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
import { Category } from '../../categories/entities/category.entity';
import { SubCategory } from '../../subcategories/entities/subcategory.entity';
import { User } from '../../users/entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ProductType {
  ALL = 'All',
  MEN = 'Men',
  WOMEN = 'Women',
  CHILD = 'Child',
  BABY = 'Baby',
}

@Entity()
export class Product {
  @ApiProperty({ example: 123 })
  @PrimaryGeneratedColumn()
  uid: number;

  @ApiProperty({ example: 'Hydrating cleanser' })
  @Column()
  name: string;

  @ApiProperty({ example: 82 })
  @Column({ type: 'double precision', default: 0 })
  validScore: number;

  @ApiProperty({ example: '3264680010535' })
  @Column({ unique: true })
  ean: string;

  @ApiProperty({ enum: ProductType, example: ProductType.ALL })
  @Column({ type: 'enum', enum: ProductType })
  type: ProductType;

  @ApiProperty({ type: () => Brand })
  @ManyToOne(() => Brand, { eager: true })
  brand: Brand;

  @ApiPropertyOptional({ type: () => Category, nullable: true })
  @ManyToOne(() => Category, { nullable: true })
  category: Category | null;

  @ApiPropertyOptional({ type: () => SubCategory, nullable: true })
  @ManyToOne(() => SubCategory, { nullable: true })
  subCategory: SubCategory | null;

  @ApiPropertyOptional({ type: () => SubSubCategory, nullable: true })
  @ManyToOne(() => SubSubCategory, { nullable: true })
  subSubCategory: SubSubCategory | null;

  @ApiProperty({ type: () => [ProductImage] })
  @OneToMany(() => ProductImage, (image) => image.product, {
    cascade: true,
  })
  images: ProductImage[];

  @ManyToMany(() => User, (u) => u.favorites)
  favoritedBy: User[];

  @ApiProperty({ type: () => [Ingredient] })
  @ManyToMany(() => Ingredient)
  @JoinTable({ name: 'product_ingredients' })
  composition: Ingredient[];

  @ApiProperty({ type: () => [Flag] })
  @ManyToMany(() => Flag)
  @JoinTable({ name: 'product_flags' })
  flags: Flag[];

  @ApiProperty({
    example: 4.5,
    description:
      'Average of each feedback row’s three-question average, rounded to one decimal',
  })
  averageRating: number;

  @ApiProperty({ example: 132 })
  ratingsCount: number;

  @ApiProperty({
    example: 4.6,
    description: 'Average effectiveness rating, rounded to one decimal',
  })
  effectivenessAverage: number;

  @ApiProperty({
    example: 4.4,
    description: 'Average needs rating, rounded to one decimal',
  })
  needsAverage: number;

  @ApiProperty({
    example: 4.5,
    description: 'Average repurchase rating, rounded to one decimal',
  })
  repurchaseAverage: number;
}
