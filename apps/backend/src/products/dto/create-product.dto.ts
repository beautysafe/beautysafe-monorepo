import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsArray,
  IsOptional,
} from 'class-validator';
import { ProductType } from '../entities/product.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNumber()
  validScore: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ean: string;

  @ApiProperty()
  @IsEnum(ProductType)
  type: ProductType;

  @ApiProperty()
  @IsNumber()
  brandId: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  subCategoryId?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  subSubCategoryId?: number;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  imageUrls?: string[];

  @ApiProperty()
  @IsArray()
  @IsOptional()
  thumbnailUrls?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Firebase image paths aligned with imageUrls',
  })
  @IsArray()
  @IsOptional()
  imageKeys?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Firebase thumbnail paths aligned with thumbnailUrls',
  })
  @IsArray()
  @IsOptional()
  thumbnailKeys?: string[];

  @ApiProperty()
  @IsArray()
  @IsOptional()
  compositionIds?: number[];

  @ApiProperty()
  @IsArray()
  @IsOptional()
  flagIds?: number[];
}
