import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { Brand } from '../brands/entities/brand.entity';
import { SubSubCategory } from '../subsubcategories/entities/subsubcategory.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { Flag } from '../flags/entities/flag.entity';
import { SubCategory } from '../subcategories/entities/subcategory.entity';
import { Category } from '../categories/entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductImage,
      Brand,
      Ingredient,
      Flag,
      Category,
      SubCategory,
      SubSubCategory,
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
