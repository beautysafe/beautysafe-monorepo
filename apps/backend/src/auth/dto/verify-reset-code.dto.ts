import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';
import { ForgotPasswordDto } from './forgot-password.dto';

export class VerifyResetCodeDto extends ForgotPasswordDto {
  @ApiProperty({ example: '582941', pattern: '^\\d{6}$' })
  @Matches(/^\d{6}$/, { message: 'code must contain exactly 6 digits' })
  code: string;
}
