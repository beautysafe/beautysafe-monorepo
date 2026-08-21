import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class UserMeDto {
  @ApiProperty() id: number;
  @ApiProperty() email: string;
  @ApiProperty({ enum: UserRole }) role: UserRole;
  @ApiProperty({
    type: Boolean,
    default: false,
    description: 'VIP users do not see advertisements',
  })
  vip: boolean;
  @ApiProperty({ required: false }) fullName?: string;
  @ApiProperty({ required: false }) birthday?: string;
  @ApiProperty({ required: false }) skinType?: string;
  @ApiProperty({ required: false }) hairType?: string;
  @ApiProperty({ required: false }) phoneNumber?: string;
  @ApiProperty({ required: false }) address?: string;
  @ApiProperty({ required: false }) avatarUrl?: string;
  @ApiProperty({ required: false }) avatarKey?: string;
}
