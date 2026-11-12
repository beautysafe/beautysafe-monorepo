import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ResolveIngredientsDto {
  @ApiProperty({
    type: [String],
    example: ['Aqua', 'Glycerin', 'New ingredient'],
    description:
      'Ingredient names pasted from a product list. Exact name or officialName matches are reused case-insensitively; missing names are created as NEW ingredients.',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(255, { each: true })
  names: string[];
}
