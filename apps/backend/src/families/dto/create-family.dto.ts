import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateFamilyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  score: number;
}
