import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Opaque refresh token returned by login or the last refresh',
    example: 'bsrt_7Kf0exampleOpaqueToken',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  refreshToken: string;
}
