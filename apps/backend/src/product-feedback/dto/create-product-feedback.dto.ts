import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductFeedbackDto {
  @ApiProperty({
    minimum: 1,
    maximum: 5,
    example: 5,
    description: 'A-t-il été efficace ? 1 = Pas du tout, 5 = Très efficace',
  })
  @IsInt()
  @Min(1)
  @Max(5)
  effectivenessRating: number;

  @ApiProperty({
    minimum: 1,
    maximum: 5,
    example: 4,
    description:
      'A-t-il répondu à vos besoins ? 1 = Pas du tout, 5 = Parfaitement',
  })
  @IsInt()
  @Min(1)
  @Max(5)
  needsRating: number;

  @ApiProperty({
    minimum: 1,
    maximum: 5,
    example: 5,
    description: 'Le rachèteriez-vous ? 1–5 stars',
  })
  @IsInt()
  @Min(1)
  @Max(5)
  repurchaseRating: number;

  @ApiPropertyOptional({ nullable: true, example: 'Très bon produit.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;
}
