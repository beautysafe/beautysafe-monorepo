import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from './product.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity()
export class ProductImage {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'https://example.com/product.jpg' })
  @Column()
  image: string;

  @ApiProperty({ example: 'https://example.com/product-thumbnail.jpg' })
  @Column()
  thumbnail: string;

  @ApiPropertyOptional({ nullable: true })
  @Column({ type: 'varchar', length: 500, nullable: true })
  imageKey?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnailKey?: string | null;

  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  product: Product;
}
