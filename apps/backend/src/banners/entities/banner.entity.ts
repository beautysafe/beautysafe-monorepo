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

  @ApiProperty({ required: false, nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string | null;

  @ApiProperty({ description: 'Image URL' })
  @Column({ type: 'varchar', length: 500 })
  image: string;

  @ApiProperty({ required: false, description: 'Firebase Storage object path' })
  @Column({ type: 'varchar', length: 500, nullable: true })
  imageKey?: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    description: 'HTML short description',
  })
  @Column({ type: 'text', nullable: true })
  shortDescription: string | null;

  @ApiProperty({ description: 'HTML blog content' })
  @Column({ type: 'text' })
  longDescriptionHtml: string;

  @ApiProperty({ default: false })
  @Column({ type: 'boolean', default: false, nullable: false })
  published: boolean;

  @ApiProperty({ type: () => [Product], required: false })
  @ManyToMany(() => Product)
  @JoinTable()
  products: Product[];
}
