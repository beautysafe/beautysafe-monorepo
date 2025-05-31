import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { SubsubcategoriesService } from './subsubcategories.service';
import { CreateSubSubCategoryDto } from './dto/create-subsubcategory.dto';
import { UpdateSubSubCategoryDto } from './dto/update-subsubcategory.dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('subsubcategories')
@Controller('subsubcategories')
export class SubsubcategoriesController {
  constructor(
    private readonly subsubcategoriesService: SubsubcategoriesService,
  ) {}
  @ApiOperation({ summary: 'Create a new subsubcategories' })
  @Post()
  create(@Body() createDto: CreateSubSubCategoryDto) {
    return this.subsubcategoriesService.create(createDto);
  }

  @Get()
  findAll() {
    return this.subsubcategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.subsubcategoriesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSubSubCategoryDto,
  ) {
    return this.subsubcategoriesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.subsubcategoriesService.remove(id);
  }
}
