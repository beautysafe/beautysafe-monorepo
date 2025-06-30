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
import { Query } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

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
  @ApiOperation({ summary: 'Get all products (with pagination)' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Number of products per page (default: 10)',
  })
  @Get()
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.productsService.findAll(+page, +limit);
  }
  @Public()
  @ApiOperation({ summary: 'Find by ean' })
  @Get('ean/:ean')
  getByEan(@Param('ean') ean: string) {
    return this.productsService.findByEan(ean);
  }
  @Get('category/:categoryId')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getByCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.productsService.findByCategory(categoryId, +page, +limit);
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
  @Get('brand/:brandId')
  getByBrand(@Param('brandId', ParseIntPipe) brandId: number) {
    return this.productsService.findByBrand(brandId);
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
