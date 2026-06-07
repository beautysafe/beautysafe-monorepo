import { PartialType } from '@nestjs/swagger';
import { CreateProductListDto } from './create-product-list.dto';

export class UpdateProductListDto extends PartialType(CreateProductListDto) {}
