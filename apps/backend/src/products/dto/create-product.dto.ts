import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsArray,
  IsOptional,
} from 'class-validator';
import { ProductType } from '../entities/product.entity';
import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty()
  @IsArray()
  @IsOptional()
  compositionIds?: number[];

  @ApiProperty()
  @IsArray()
  @IsOptional()
  flagIds?: number[];
}
