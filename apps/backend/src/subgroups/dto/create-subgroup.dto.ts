import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateSubGroupDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsUrl()
  @MaxLength(500)
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Firebase Storage object path' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageKey?: string;
}
