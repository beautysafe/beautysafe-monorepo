import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { UnavailableProductStatus } from '../entities/unavailable-product.entity';

export class UnavailableProductsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: UnavailableProductStatus,
    description: 'Filter by workflow status',
  })
  @IsOptional()
  @IsEnum(UnavailableProductStatus)
  status?: UnavailableProductStatus;

  @ApiPropertyOptional({
    example: 'cerave',
    description: 'Case-insensitive search across EAN, product name, and brand',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  q?: string;
}
