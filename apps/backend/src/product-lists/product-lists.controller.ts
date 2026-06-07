import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateProductListDto } from './dto/create-product-list.dto';
import { ProductListProductsDto } from './dto/product-list-products.dto';
import { UpdateProductListDto } from './dto/update-product-list.dto';
import { ProductListsService } from './product-lists.service';

@ApiBearerAuth()
@ApiTags('product-lists')
@Controller()
export class ProductListsController {
  constructor(private readonly productListsService: ProductListsService) {}

  @Roles('admin')
  @ApiOperation({ summary: 'Create a new product list' })
  @Post('subgroups/:subgroupId/product-lists')
  create(
    @Param('subgroupId', ParseIntPipe) subgroupId: number,
    @Body() createProductListDto: CreateProductListDto,
  ) {
    return this.productListsService.create(subgroupId, createProductListDto);
  }

  @Public()
  @Get('product-lists/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productListsService.findOne(id);
  }

  @Public()
  @Get('product-lists/:id/products')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findProducts(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.productListsService.findProducts(id, +page, +limit);
  }

  @Roles('admin')
  @ApiOperation({ summary: 'Update a product list' })
  @Patch('product-lists/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductListDto: UpdateProductListDto,
  ) {
    return this.productListsService.update(id, updateProductListDto);
  }

  @Roles('admin')
  @Delete('product-lists/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productListsService.remove(id);
  }

  @Roles('admin')
  @Post('product-lists/:id/products')
  addProducts(
    @Param('id', ParseIntPipe) id: number,
    @Body() productListProductsDto: ProductListProductsDto,
  ) {
    return this.productListsService.addProducts(id, productListProductsDto);
  }

  @Roles('admin')
  @Delete('product-lists/:id/products/:productId')
  removeProduct(
    @Param('id', ParseIntPipe) id: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.productListsService.removeProduct(id, productId);
  }
}
