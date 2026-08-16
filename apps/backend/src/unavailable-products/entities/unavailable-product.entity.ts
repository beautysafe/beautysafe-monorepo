import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  Check,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';

export enum UnavailableProductStatus {
  PENDING = 'PENDING',
  REVIEWING = 'REVIEWING',
  ADDED = 'ADDED',
  REJECTED = 'REJECTED',
}

@Entity('unavailable_products')
@Check('CHK_unavailable_products_images', 'cardinality("imageUrls") >= 1')
@Index('IDX_unavailable_products_user_id', ['userId'])
@Index('IDX_unavailable_products_created_at', ['createdAt'])
@Index('IDX_unavailable_products_status', ['status'])
@Index('IDX_unavailable_products_ean', ['ean'])
export class UnavailableProduct {
  @ApiProperty({ example: 42 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiPropertyOptional({ nullable: true, example: '1234567890123' })
  @Column({ type: 'varchar', length: 64, nullable: true })
  ean: string | null;

  @ApiPropertyOptional({ nullable: true, example: 12 })
  @Column({ type: 'integer', nullable: true })
  userId: number | null;

  @ApiPropertyOptional({ nullable: true, example: 'Hydrating cleanser' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  productName: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'CeraVe' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  brandName: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Front and ingredient list' })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ApiProperty({
    type: [String],
    minItems: 1,
    example: [
      'https://example.com/product-front.jpg',
      'https://example.com/product-back.jpg',
    ],
  })
  @Column('text', { array: true })
  imageUrls: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Firebase Storage paths aligned with imageUrls when uploaded',
  })
  @Column('text', { array: true, default: () => "'{}'" })
  imageKeys: string[];

  @ApiProperty({ enum: UnavailableProductStatus })
  @Column({
    type: 'enum',
    enum: UnavailableProductStatus,
    default: UnavailableProductStatus.PENDING,
  })
  status: UnavailableProductStatus;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiPropertyOptional({ nullable: true })
  @Column({ type: 'timestamp with time zone', nullable: true })
  resolvedAt: Date | null;

  @ApiPropertyOptional({ nullable: true, example: 123 })
  @Column({ type: 'integer', nullable: true })
  resolvedProductId: number | null;

  @ApiPropertyOptional({ type: () => User, nullable: true })
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user?: User | null;

  @ApiPropertyOptional({ type: () => Product, nullable: true })
  @ManyToOne(() => Product, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'resolvedProductId', referencedColumnName: 'uid' })
  resolvedProduct?: Product | null;
}
