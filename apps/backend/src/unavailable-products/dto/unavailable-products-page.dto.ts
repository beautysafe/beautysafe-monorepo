import { ApiProperty } from '@nestjs/swagger';
import { UnavailableProduct } from '../entities/unavailable-product.entity';

export class UnavailableProductsPageDto {
  @ApiProperty({ type: [UnavailableProduct] })
  items: UnavailableProduct[];

  @ApiProperty({ example: 58 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}
