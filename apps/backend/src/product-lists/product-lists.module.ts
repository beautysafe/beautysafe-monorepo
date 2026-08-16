import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { SubGroup } from '../subgroups/entities/subgroup.entity';
import { ProductList } from './entities/product-list.entity';
import { ProductListsController } from './product-lists.controller';
import { ProductListsService } from './product-lists.service';
import { ProductFeedbackModule } from '../product-feedback/product-feedback.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductList, SubGroup, Product]),
    ProductFeedbackModule,
  ],
  controllers: [ProductListsController],
  providers: [ProductListsService],
})
export class ProductListsModule {}
