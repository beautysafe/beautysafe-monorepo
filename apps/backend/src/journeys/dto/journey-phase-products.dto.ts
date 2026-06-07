import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class JourneyPhaseProductsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ean?: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eans?: string[];
}
