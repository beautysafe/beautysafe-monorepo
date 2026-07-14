import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  IsUrl,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateStoryDto {
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

  @ApiPropertyOptional({
    description: 'Firebase Storage path returned by the upload endpoint',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageKey?: string;

  @ApiProperty({ type: [String], description: 'Video URLs' })
  @IsArray()
  @IsNotEmpty()
  @IsUrl({}, { each: true })
  @MaxLength(500, { each: true })
  videos: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Firebase Storage paths aligned with videos',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  videoKeys?: string[];
}
