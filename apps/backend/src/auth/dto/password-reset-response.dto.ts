import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordResponseDto {
  @ApiProperty({
    example:
      'Si un compte correspond à cette adresse, un code de vérification a été envoyé.',
  })
  message: string;
}

export class VerifyResetCodeResponseDto {
  @ApiProperty({
    example: 'bspr_secure-temporary-token',
    description: 'Temporary, single-use password-reset token',
  })
  resetToken: string;

  @ApiProperty({
    format: 'date-time',
    example: '2026-11-13T12:10:00.000Z',
  })
  resetTokenExpiresAt: string;
}

export class ResetPasswordResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Votre mot de passe a été réinitialisé.' })
  message: string;
}
