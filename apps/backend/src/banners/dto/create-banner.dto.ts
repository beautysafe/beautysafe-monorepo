import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsUrl,
  MaxLength,
  IsArray,
  IsInt,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateBannerDto {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Image URL' })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  @MaxLength(500)
  image: string;

  @ApiPropertyOptional({
    description: 'Firebase Storage path returned by the upload endpoint',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageKey?: string;

  @ApiPropertyOptional({
    nullable: true,
    description: 'HTML short description',
  })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty({ description: 'HTML blog content' })
  @IsString()
  @IsNotEmpty()
  longDescriptionHtml: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiProperty({
    type: [Number],
    required: false,
    example: [1, 2, 3],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  productIds?: number[];
}
