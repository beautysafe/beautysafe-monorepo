import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsNumber, IsOptional, Min } from 'class-validator';

function toIntArray(value: any): number[] {
  if (value === undefined || value === null || value === '') return [];
  if (Array.isArray(value)) return value.map((v) => parseInt(v, 10)).filter(Number.isFinite);
  return String(value)
    .split(',')
    .map((v) => parseInt(v.trim(), 10))
    .filter(Number.isFinite);
}

export class SearchProductsDto {
  @ApiPropertyOptional({ example: '1,2,3', description: 'Comma-separated brand IDs' })
  @IsOptional()
  @Transform(({ value }) => toIntArray(value))
  @IsArray()
  brandIds?: number[];

  @ApiPropertyOptional({ example: '1,2', description: 'Comma-separated category IDs' })
  @IsOptional()
  @Transform(({ value }) => toIntArray(value))
  @IsArray()
  categoryIds?: number[];

  @ApiPropertyOptional({ example: '10,11', description: 'Comma-separated subCategory IDs' })
  @IsOptional()
  @Transform(({ value }) => toIntArray(value))
  @IsArray()
  subCategoryIds?: number[];

  @ApiPropertyOptional({ example: '20,21', description: 'Comma-separated subSubCategory IDs' })
  @IsOptional()
  @Transform(({ value }) => toIntArray(value))
  @IsArray()
  subSubCategoryIds?: number[];

  @ApiPropertyOptional({ example: '100,101', description: 'Include ingredient IDs' })
  @IsOptional()
  @Transform(({ value }) => toIntArray(value))
  @IsArray()
  includeIngredientIds?: number[];

  @ApiPropertyOptional({ example: '200,201', description: 'Exclude ingredient IDs' })
  @IsOptional()
  @Transform(({ value }) => toIntArray(value))
  @IsArray()
  excludeIngredientIds?: number[];

  @ApiPropertyOptional({ example: true, description: 'If true, product must contain ALL includeIngredientIds' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  requireAllIngredients?: boolean;

  @ApiPropertyOptional({ example: '4,5', description: 'Include flag IDs' })
  @IsOptional()
  @Transform(({ value }) => toIntArray(value))
  @IsArray()
  flagIds?: number[];

  @ApiPropertyOptional({ example: true, description: 'If true, product must contain ALL flagIds' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  requireAllFlags?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  minScore?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  maxScore?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
