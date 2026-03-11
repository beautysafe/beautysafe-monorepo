import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  IsUrl,
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

  @ApiProperty({ type: [String], description: 'Video URLs' })
  @IsArray()
  @IsNotEmpty()
  @IsUrl({}, { each: true })
  @MaxLength(500, { each: true })
  videos: string[];
}
