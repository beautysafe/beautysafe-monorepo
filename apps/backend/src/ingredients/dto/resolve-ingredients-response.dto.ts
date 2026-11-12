import { ApiProperty } from '@nestjs/swagger';
import { Ingredient } from '../entities/ingredient.entity';

export class AmbiguousIngredientMatchDto {
  @ApiProperty({ example: 'AQUA' })
  input: string;

  @ApiProperty({ type: [Ingredient] })
  matches: Ingredient[];
}

export class ResolveIngredientsResponseDto {
  @ApiProperty({ type: [Ingredient] })
  ingredients: Ingredient[];

  @ApiProperty({ example: 4 })
  existingCount: number;

  @ApiProperty({ example: 1 })
  newCount: number;

  @ApiProperty({ type: [AmbiguousIngredientMatchDto] })
  ambiguous: AmbiguousIngredientMatchDto[];
}
