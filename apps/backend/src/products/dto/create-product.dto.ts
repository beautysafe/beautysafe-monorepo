import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsArray,
  IsOptional,
  IsUrl,
  ArrayUnique,
  MaxLength,
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

  @ApiProperty({
    type: [String],
    required: false,
    description:
      'Uploaded Firebase URLs and/or direct HTTP(S) image URLs. Duplicates are rejected.',
  })
  @IsArray()
  @IsOptional()
  @ArrayUnique()
  @IsUrl({}, { each: true })
  @MaxLength(2000, { each: true })
  imageUrls?: string[];

  @ApiProperty({
    type: [String],
    required: false,
    description:
      'Thumbnail URLs aligned with imageUrls. A direct image URL may be used for both.',
  })
  @IsArray()
  @IsOptional()
  @IsUrl({}, { each: true })
  @MaxLength(2000, { each: true })
  thumbnailUrls?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Firebase image paths aligned with imageUrls',
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  imageKeys?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Firebase thumbnail paths aligned with thumbnailUrls',
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @MaxLength(500, { each: true })
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
