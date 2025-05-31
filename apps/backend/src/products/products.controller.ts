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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiBearerAuth()
@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new product' })
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }
  @Roles('admin')
  @ApiOperation({ summary: 'Get all products' })
  @Get()
  findAll() {
    return this.productsService.findAll();
  }
  @Public()
  @ApiOperation({ summary: 'Find by ean' })
  @Get('ean/:ean')
  getByEan(@Param('ean') ean: string) {
    return this.productsService.findByEan(ean);
  }
  @Public()
  @Get('category/:categoryId')
  getByCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.productsService.findByCategory(categoryId);
  }
  @Public()
  @Get('subcategory/:subCategoryId')
  getBySubCategory(
    @Param('subCategoryId', ParseIntPipe) subCategoryId: number,
  ) {
    return this.productsService.findBySubCategory(subCategoryId);
  }
  @Public()
  @Get('subsubcategory/:subSubCategoryId')
  getBySubSubCategory(
    @Param('subSubCategoryId', ParseIntPipe) subSubCategoryId: number,
  ) {
    return this.productsService.findBySubSubCategory(subSubCategoryId);
  }
  @Public()
  @Get('flag/:flagId')
  getByFlag(@Param('flagId', ParseIntPipe) flagId: number) {
    return this.productsService.findByFlag(flagId);
  }
  @Roles('admin')
  @Get(':uid')
  findOne(@Param('uid', ParseIntPipe) uid: number) {
    return this.productsService.findOne(uid);
  }
  @Roles('admin')
  @Patch(':uid')
  update(
    @Param('uid', ParseIntPipe) uid: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(uid, updateProductDto);
  }
  @Roles('admin')
  @Delete(':uid')
  remove(@Param('uid', ParseIntPipe) uid: number) {
    return this.productsService.remove(uid);
  }
}
