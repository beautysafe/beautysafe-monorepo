import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../user.entity';

export class UserMeDto {
  @ApiProperty() id: number;
  @ApiProperty() email: string;
  @ApiProperty({ enum: UserRole }) role: UserRole;

  @ApiProperty({ required: false }) birthday?: string;
  @ApiProperty({ required: false }) skinType?: string;
  @ApiProperty({ required: false }) hairType?: string;
  @ApiProperty({ required: false }) phoneNumber?: string;
  @ApiProperty({ required: false }) address?: string;
}
