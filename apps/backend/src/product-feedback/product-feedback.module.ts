import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { ProductFeedback } from './entities/product-feedback.entity';
import {
  AdminProductFeedbackController,
  ProductFeedbackController,
} from './product-feedback.controller';
import { ProductFeedbackService } from './product-feedback.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductFeedback, Product])],
  controllers: [ProductFeedbackController, AdminProductFeedbackController],
  providers: [ProductFeedbackService],
  exports: [ProductFeedbackService],
})
export class ProductFeedbackModule {}
