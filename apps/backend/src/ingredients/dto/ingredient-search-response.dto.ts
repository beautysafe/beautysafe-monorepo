import { ApiProperty } from '@nestjs/swagger';
import { Ingredient } from '../entities/ingredient.entity';

export class IngredientSearchResponseDto {
  @ApiProperty({ type: [Ingredient] })
  items: Ingredient[];

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}
