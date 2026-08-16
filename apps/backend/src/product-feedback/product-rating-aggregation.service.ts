import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductRatingSummaryDto } from './dto/product-feedback-page.dto';
import { ProductFeedback } from './entities/product-feedback.entity';
import { roundRating } from './product-feedback.utils';

type RawProductRatingSummary = {
  productId: string;
  ratingsCount: string;
  averageRating: string | null;
  effectivenessAverage: string | null;
  needsAverage: string | null;
  repurchaseAverage: string | null;
};

@Injectable()
export class ProductRatingAggregationService {
  constructor(
    @InjectRepository(ProductFeedback)
    private readonly feedbackRepository: Repository<ProductFeedback>,
  ) {}

  async getForProduct(productId: number): Promise<ProductRatingSummaryDto> {
    const summaries = await this.getForProducts([productId]);
    return summaries.get(productId) ?? this.emptySummary();
  }

  async attachToProducts<T extends { uid: number }>(
    products: T[],
  ): Promise<Array<T & ProductRatingSummaryDto>> {
    if (!products.length) return [];

    const summaries = await this.getForProducts(
      products.map((product) => product.uid),
    );

    return products.map((product) =>
      Object.assign(product, summaries.get(product.uid) ?? this.emptySummary()),
    );
  }

  private async getForProducts(
    productIds: number[],
  ): Promise<Map<number, ProductRatingSummaryDto>> {
    const uniqueProductIds = [...new Set(productIds)];
    if (!uniqueProductIds.length) return new Map();

    const rows = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .select('feedback.productId', 'productId')
      .addSelect('COUNT(feedback.id)', 'ratingsCount')
      .addSelect(
        'AVG((feedback.effectivenessRating + feedback.needsRating + feedback.repurchaseRating) / 3.0)',
        'averageRating',
      )
      .addSelect('AVG(feedback.effectivenessRating)', 'effectivenessAverage')
      .addSelect('AVG(feedback.needsRating)', 'needsAverage')
      .addSelect('AVG(feedback.repurchaseRating)', 'repurchaseAverage')
      .where('feedback.productId IN (:...productIds)', {
        productIds: uniqueProductIds,
      })
      .groupBy('feedback.productId')
      .getRawMany<RawProductRatingSummary>();

    return new Map(
      rows.map((row) => [
        Number(row.productId),
        {
          averageRating: this.roundRaw(row.averageRating),
          ratingsCount: Number(row.ratingsCount),
          effectivenessAverage: this.roundRaw(row.effectivenessAverage),
          needsAverage: this.roundRaw(row.needsAverage),
          repurchaseAverage: this.roundRaw(row.repurchaseAverage),
        },
      ]),
    );
  }

  private emptySummary(): ProductRatingSummaryDto {
    return {
      averageRating: 0,
      ratingsCount: 0,
      effectivenessAverage: 0,
      needsAverage: 0,
      repurchaseAverage: 0,
    };
  }

  private roundRaw(value: string | null) {
    return value === null ? 0 : roundRating(Number(value));
  }
}
