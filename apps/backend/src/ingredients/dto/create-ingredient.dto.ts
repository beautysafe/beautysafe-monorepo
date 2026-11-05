import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
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
    enum: IngredientStatus,
    default: IngredientStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(IngredientStatus)
  status?: IngredientStatus;
}
