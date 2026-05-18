import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsUrl,
  MaxLength,
  IsArray,
  IsInt,
  IsOptional,
} from 'class-validator';

export class CreateBannerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Image URL' })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  @MaxLength(500)
  image: string;

  @ApiProperty({ description: 'HTML blog content' })
  @IsString()
  @IsNotEmpty()
  shortDescription: string;

  @ApiProperty({ description: 'HTML blog content' })
  @IsString()
  @IsNotEmpty()
  longDescriptionHtml: string;

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