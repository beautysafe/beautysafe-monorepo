import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateUnavailableProductDto {
  @ApiPropertyOptional({
    nullable: true,
    example: '1234567890123',
    description: 'Optional EAN/barcode. A submission is valid without it.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  ean?: string;

  @ApiPropertyOptional({ example: 'Hydrating cleanser' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  productName?: string;

  @ApiPropertyOptional({ example: 'CeraVe' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  brandName?: string;

  @ApiPropertyOptional({ example: 'The back photo contains the ingredients.' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;

  @ApiProperty({
    type: [String],
    minItems: 1,
    maxItems: 10,
    description: 'At least one product photo URL is required. EAN is optional.',
    example: [
      'https://example.com/product-front.jpg',
      'https://example.com/product-back.jpg',
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @ArrayUnique()
  @IsUrl({}, { each: true })
  @MaxLength(2000, { each: true })
  imageUrls: string[];

  @ApiPropertyOptional({
    type: [String],
    maxItems: 10,
    description:
      'Optional Firebase paths returned by POST /unavailable-products/images, aligned with imageUrls',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  imageKeys?: string[];
}
