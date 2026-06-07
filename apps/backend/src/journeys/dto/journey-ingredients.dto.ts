import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional } from 'class-validator';

export class JourneyIngredientsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  ingredientId?: number;

  @ApiProperty({ type: [Number], required: false })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  ingredientIds?: number[];
}
