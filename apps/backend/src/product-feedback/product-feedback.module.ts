import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { ProductFeedback } from './entities/product-feedback.entity';
import {
  AdminProductFeedbackController,
  ProductFeedbackController,
} from './product-feedback.controller';
import { ProductFeedbackService } from './product-feedback.service';
import { ProductRatingAggregationService } from './product-rating-aggregation.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductFeedback, Product])],
  controllers: [ProductFeedbackController, AdminProductFeedbackController],
  providers: [ProductFeedbackService, ProductRatingAggregationService],
  exports: [ProductFeedbackService, ProductRatingAggregationService],
})
export class ProductFeedbackModule {}
