import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, MaxLength, IsUrl } from 'class-validator';

export class UpdateMeDto {
  @ApiPropertyOptional({ example: 'Ilyas Chenouf' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  fullName?: string;
  
  @ApiPropertyOptional({ example: '1995-06-30' })
  @IsOptional()
  @IsDateString()
  birthday?: string;

  @ApiPropertyOptional({ example: 'oily' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  skinType?: string;

  @ApiPropertyOptional({ example: 'curly' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  hairType?: string;

  @ApiPropertyOptional({ example: '+213123456789' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'Algiers, Algeria' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({ example: 'https://firebasestorage.googleapis.com/v0/b/<project>.appspot.com/o/avatars%2Fuser-1.jpg?alt=media&token=...' })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  avatarUrl?: string;

  // ✅ Optional: Firebase storage path (for later delete/replace)
  @ApiPropertyOptional({ example: 'avatars/user-1.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatarKey?: string;
}
