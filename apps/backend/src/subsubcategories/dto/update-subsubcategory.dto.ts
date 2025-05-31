import { PartialType } from '@nestjs/swagger';
import { CreateSubSubCategoryDto } from './create-subsubcategory.dto';

export class UpdateSubSubCategoryDto extends PartialType(CreateSubSubCategoryDto) {}
