import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity()
export class Banner {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({ description: 'Image URL' })
  @Column({ type: 'varchar', length: 500 })
  image: string;

  @ApiProperty({ description: 'HTML blog content' })
  @Column({ type: 'text' })
  shortDescription: string;

  @ApiProperty({ description: 'HTML blog content' })
  @Column({ type: 'text' })
  longDescriptionHtml: string;

  @ManyToMany(() => Product)
  @JoinTable()
  products: Product[];
}