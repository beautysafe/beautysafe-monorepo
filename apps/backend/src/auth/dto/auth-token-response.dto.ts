import { ApiProperty } from '@nestjs/swagger';

export class AuthTokenResponseDto {
  @ApiProperty({ description: 'One-hour Bearer JWT used for protected APIs' })
  accessToken: string;

  @ApiProperty({
    description:
      'Opaque rotating token. Persist securely and replace it after every refresh.',
  })
  refreshToken: string;

  @ApiProperty({
    format: 'date-time',
    example: '2026-08-16T14:00:00.000Z',
  })
  accessTokenExpiresAt: string;

  @ApiProperty({
    format: 'date-time',
    example: '2027-08-16T13:00:00.000Z',
  })
  refreshTokenExpiresAt: string;
}

export class LoginResponseDto extends AuthTokenResponseDto {
  @ApiProperty({
    description:
      'Legacy alias for accessToken retained for existing BeautySafe clients',
  })
  access_token: string;
}

export class LogoutResponseDto {
  @ApiProperty({ example: true })
  success: boolean;
}
