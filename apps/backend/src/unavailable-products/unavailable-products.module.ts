import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { UnavailableProduct } from './entities/unavailable-product.entity';
import { UnavailableProductsController } from './unavailable-products.controller';
import { UnavailableProductsService } from './unavailable-products.service';

@Module({
  imports: [TypeOrmModule.forFeature([UnavailableProduct, Product])],
  controllers: [UnavailableProductsController],
  providers: [UnavailableProductsService],
})
export class UnavailableProductsModule {}
