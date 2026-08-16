import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@beautysafe.online' })
  @IsEmail()
  email: string;

  @ApiProperty({ format: 'password', minLength: 6, writeOnly: true })
  @IsString()
  @MinLength(6)
  password: string;
}
