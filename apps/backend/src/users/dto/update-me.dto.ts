import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, MaxLength } from 'class-validator';

export class UpdateMeDto {
  @ApiPropertyOptional({ example: '1995-06-30' })
  @IsOptional()
  @IsDateString()
  birthday?: string;

  @ApiPropertyOptional({ example: 'oily' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  skinType?: string;

  @ApiPropertyOptional({ example: 'curly' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  hairType?: string;

  @ApiPropertyOptional({ example: '+213123456789' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'Algiers, Algeria' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;
}
