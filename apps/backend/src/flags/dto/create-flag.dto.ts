import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFlagDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}
