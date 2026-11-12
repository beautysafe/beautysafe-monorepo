import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsInt,
  IsIn,
} from 'class-validator';
import { IngredientStatus } from '../entities/ingredient.entity';

export class CreateIngredientDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  officialName: string;
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  score: number;

  @ApiPropertyOptional({
    enum: [0, 2, 3, 5, 10],
    default: 0,
    description: 'BeautySafe ingredient risk score',
  })
  @IsOptional()
  @IsInt()
  @IsIn([0, 2, 3, 5, 10])
  bs_score?: number;

  @ApiPropertyOptional({
    enum: IngredientStatus,
    default: IngredientStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(IngredientStatus)
  status?: IngredientStatus;
}
