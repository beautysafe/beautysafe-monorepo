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
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';

@Entity('product_feedback')
@Check(
  'CHK_product_feedback_ratings',
  '"effectivenessRating" BETWEEN 1 AND 5 AND "needsRating" BETWEEN 1 AND 5 AND "repurchaseRating" BETWEEN 1 AND 5',
)
@Unique('UQ_product_feedback_user_product', ['userId', 'productId'])
@Index('IDX_product_feedback_product_id', ['productId'])
@Index('IDX_product_feedback_user_id', ['userId'])
@Index('IDX_product_feedback_created_at', ['createdAt'])
export class ProductFeedback {
  @ApiProperty({ example: 91 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 123 })
  @Column({ type: 'integer' })
  productId: number;

  @ApiProperty({ example: 12 })
  @Column({ type: 'integer' })
  userId: number;

  @ApiProperty({ minimum: 1, maximum: 5, example: 5 })
  @Column({ type: 'smallint' })
  effectivenessRating: number;

  @ApiProperty({ minimum: 1, maximum: 5, example: 4 })
  @Column({ type: 'smallint' })
  needsRating: number;

  @ApiProperty({ minimum: 1, maximum: 5, example: 5 })
  @Column({ type: 'smallint' })
  repurchaseRating: number;

  @ApiPropertyOptional({ nullable: true, example: 'Très bon produit.' })
  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @ApiProperty({ example: 4.7, description: 'Mean of the three ratings' })
  averageRating: number;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiPropertyOptional({ type: () => Product })
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId', referencedColumnName: 'uid' })
  product?: Product;

  @ApiPropertyOptional({ type: () => User })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user?: User;
}
