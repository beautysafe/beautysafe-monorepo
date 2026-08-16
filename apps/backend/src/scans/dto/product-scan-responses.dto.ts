import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ScanBrandDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Example' })
  name: string;
}

class ScannedProductDto {
  @ApiProperty({ example: 123 })
  uid: number;

  @ApiProperty({ example: '3264680010535' })
  ean: string;

  @ApiProperty({ example: 'Example Product' })
  name: string;

  @ApiProperty({ type: ScanBrandDto })
  brand: ScanBrandDto;

  @ApiPropertyOptional({
    nullable: true,
    example: 'https://example.com/image.jpg',
  })
  image: string | null;
}

export class ProductScanItemDto {
  @ApiProperty({ example: 100 })
  id: number;

  @ApiProperty({ example: '2026-08-16T10:00:00.000Z' })
  scannedAt: Date;

  @ApiProperty({ type: ScannedProductDto })
  product: ScannedProductDto;
}

export class RecordedProductScanDto {
  @ApiProperty({ example: 100 })
  id: number;

  @ApiProperty({ example: 123 })
  productId: number;

  @ApiPropertyOptional({ nullable: true, example: '3264680010535' })
  ean: string | null;

  @ApiProperty({ example: '2026-08-16T10:00:00.000Z' })
  scannedAt: Date;
}

export class ProductScansPageDto {
  @ApiProperty({ type: [ProductScanItemDto] })
  items: ProductScanItemDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 58 })
  total: number;

  @ApiProperty({ example: 3 })
  totalPages: number;

  @ApiProperty({ example: 58 })
  totalScans: number;
}

export class ProductScanStatsDto {
  @ApiProperty({ example: 58 })
  totalScans: number;

  @ApiProperty({ example: 26 })
  uniqueProducts: number;
}
