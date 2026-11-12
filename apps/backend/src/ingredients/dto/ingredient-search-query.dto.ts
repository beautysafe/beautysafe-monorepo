import { Type, Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IngredientStatus } from '../entities/ingredient.entity';

const trimQuery = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class IngredientSearchQueryDto {
  @ApiPropertyOptional({
    example: 'AQUA',
    description:
      'Unified case-insensitive partial search across name and officialName. Exact matches are returned first.',
  })
  @IsOptional()
  @Transform(trimQuery)
  @IsString()
  @MaxLength(255)
  q?: string;

  @ApiPropertyOptional({
    example: 'Eau',
    description: 'Backward-compatible ingredient name filter',
  })
  @IsOptional()
  @Transform(trimQuery)
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    example: 'AQUA',
    description: 'Backward-compatible official-name filter',
  })
  @IsOptional()
  @Transform(trimQuery)
  @IsString()
  @MaxLength(255)
  officialName?: string;

  @ApiPropertyOptional({ enum: IngredientStatus })
  @IsOptional()
  @IsEnum(IngredientStatus)
  status?: IngredientStatus;

  @ApiPropertyOptional({ minimum: 1, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
