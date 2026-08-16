import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export enum SortOrder {
  NEWEST = 'newest',
  OLDEST = 'oldest',
}

const toPositiveInteger = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export class PaginationQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 1, example: 1 })
  @IsOptional()
  @Transform(({ value }) => toPositiveInteger(value, 1))
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20, example: 20 })
  @IsOptional()
  @Transform(({ value }) => toPositiveInteger(value, 20))
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @ApiPropertyOptional({
    enum: SortOrder,
    default: SortOrder.NEWEST,
    description: 'Sort by creation date',
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sort: SortOrder = SortOrder.NEWEST;
}
