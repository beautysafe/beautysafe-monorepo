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
import { ProductFeedbackModule } from '../product-feedback/product-feedback.module';
import { BeautySafeScoringModule } from '../beautysafe-scoring/beautysafe-scoring.module';

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
    ProductFeedbackModule,
    BeautySafeScoringModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
