import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';

@Entity('product_scans')
@Index('IDX_product_scans_user_id', ['userId'])
@Index('IDX_product_scans_product_id', ['productId'])
@Index('IDX_product_scans_scanned_at', ['scannedAt'])
@Index('IDX_product_scans_user_scanned_at', ['userId', 'scannedAt'])
export class ProductScan {
  @ApiProperty({ example: 100 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 12 })
  @Column({ type: 'integer' })
  userId: number;

  @ApiProperty({ example: 123 })
  @Column({ type: 'integer' })
  productId: number;

  @ApiPropertyOptional({ nullable: true, example: '3264680010535' })
  @Column({ type: 'varchar', length: 64, nullable: true })
  ean: string | null;

  @ApiProperty({ example: '2026-08-16T10:00:00.000Z' })
  @CreateDateColumn({ type: 'timestamp with time zone' })
  scannedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user?: User;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId', referencedColumnName: 'uid' })
  product?: Product;
}
