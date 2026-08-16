import { ApiProperty } from '@nestjs/swagger';
import { ProductFeedback } from '../entities/product-feedback.entity';

export class ProductFeedbackPageDto {
  @ApiProperty({ type: [ProductFeedback] })
  items: ProductFeedback[];

  @ApiProperty({ example: 132 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 7 })
  totalPages: number;
}

export class ProductRatingSummaryDto {
  @ApiProperty({ example: 4.5 })
  averageRating: number;

  @ApiProperty({ example: 132 })
  ratingsCount: number;

  @ApiProperty({ example: 4.6 })
  effectivenessAverage: number;

  @ApiProperty({ example: 4.4 })
  needsAverage: number;

  @ApiProperty({ example: 4.5 })
  repurchaseAverage: number;
}
