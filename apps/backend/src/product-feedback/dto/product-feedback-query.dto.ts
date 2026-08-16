import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ProductFeedbackQueryDto extends PaginationQueryDto {}

export class AdminProductFeedbackQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: '3264680010535',
    description:
      'Case-insensitive search across product name, EAN, user email, and user name',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  q?: string;

  @ApiPropertyOptional({
    type: Number,
    minimum: 1,
    example: 123,
    description: 'Filter by exact product UID',
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  productId?: number;
}
