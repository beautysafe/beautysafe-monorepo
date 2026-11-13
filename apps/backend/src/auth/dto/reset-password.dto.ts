import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'bspr_secure-temporary-token',
    description: 'Single-use token returned by verify-reset-code',
  })
  @IsString()
  @MinLength(32)
  @MaxLength(256)
  resetToken: string;

  @ApiProperty({
    example: 'NewSecurePassword123!',
    minLength: 6,
    format: 'password',
    writeOnly: true,
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
