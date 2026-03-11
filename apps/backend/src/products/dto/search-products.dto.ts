import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

function toIntArray(value: any): number[] | undefined {
  if (value === undefined || value === null || value === '') return undefined;

  const arr = (Array.isArray(value) ? value : String(value).split(','))
    .map((v) => Number(String(v).trim()))
    .filter((n) => Number.isInteger(n));

  return arr.length ? arr : undefined;
}

function toNumber(value: any): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function toPositiveInt(value: any, fallback: number): number {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

export class SearchProductsDto {
  @ApiPropertyOptional({ example: '1,2,3' })
  @IsOptional()
  @Transform(({ value }) => toIntArray(value))
  @IsArray()
  @IsInt({ each: true })
  brandIds?: number[];

  @ApiPropertyOptional({ example: '1,2' })
  @IsOptional()
  @Transform(({ value }) => toIntArray(value))
  @IsArray()
  @IsInt({ each: true })
  categoryIds?: number[];

  @ApiPropertyOptional({ example: '10,11' })
  @IsOptional()
  @Transform(({ value }) => toIntArray(value))
  @IsArray()
  @IsInt({ each: true })
  subCategoryIds?: number[];

  @ApiPropertyOptional({ example: '20,21' })
  @IsOptional()
  @Transform(({ value }) => toIntArray(value))
  @IsArray()
  @IsInt({ each: true })
  subSubCategoryIds?: number[];

  @ApiPropertyOptional({ example: '100,101' })
  @IsOptional()
  @Transform(({ value }) => toIntArray(value))
  @IsArray()
  @IsInt({ each: true })
  includeIngredientIds?: number[];

  @ApiPropertyOptional({ example: '200,201' })
  @IsOptional()
  @Transform(({ value }) => toIntArray(value))
  @IsArray()
  @IsInt({ each: true })
  excludeIngredientIds?: number[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  requireAllIngredients?: boolean;

  @ApiPropertyOptional({ example: '4,5' })
  @IsOptional()
  @Transform(({ value }) => toIntArray(value))
  @IsArray()
  @IsInt({ each: true })
  flagIds?: number[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  requireAllFlags?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  minScore?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  maxScore?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Transform(({ value }) => toPositiveInt(value, 1))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Transform(({ value }) => toPositiveInt(value, 10))
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
