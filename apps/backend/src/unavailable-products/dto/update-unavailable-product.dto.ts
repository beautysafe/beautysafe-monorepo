import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { UnavailableProductStatus } from '../entities/unavailable-product.entity';

export class UpdateUnavailableProductDto {
  @ApiPropertyOptional({
    enum: UnavailableProductStatus,
    example: UnavailableProductStatus.REVIEWING,
  })
  @IsOptional()
  @IsEnum(UnavailableProductStatus)
  status?: UnavailableProductStatus;

  @ApiPropertyOptional({
    nullable: true,
    example: 123,
    description: 'Existing product UID, or null to remove the link',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  resolvedProductId?: number | null;
}
