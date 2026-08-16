import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CreateProductScanDto {
  @ApiProperty({
    type: Number,
    minimum: 1,
    example: 123,
    description: 'UID of the product returned by a successful barcode lookup',
  })
  @IsInt()
  @Min(1)
  productId: number;
}
