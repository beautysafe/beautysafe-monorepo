import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { ProductScan } from './entities/product-scan.entity';
import { ScansController, UserScansController } from './scans.controller';
import { ScansService } from './scans.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductScan, Product])],
  controllers: [ScansController, UserScansController],
  providers: [ScansService],
})
export class ScansModule {}
