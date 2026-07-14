import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class ProductImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  image: string;

  @Column()
  thumbnail: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageKey?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnailKey?: string | null;

  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  product: Product;
}
