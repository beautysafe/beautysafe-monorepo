import { Repository } from 'typeorm';
import { ProductFeedback } from './entities/product-feedback.entity';
import { ProductRatingAggregationService } from './product-rating-aggregation.service';

type RawSummary = {
  productId: string;
  ratingsCount: string;
  averageRating: string | null;
  effectivenessAverage: string | null;
  needsAverage: string | null;
  repurchaseAverage: string | null;
};

const createSubject = (rows: RawSummary[]) => {
  const queryBuilder: Record<string, jest.Mock> = {};
  queryBuilder.select = jest.fn().mockReturnValue(queryBuilder);
  queryBuilder.addSelect = jest.fn().mockReturnValue(queryBuilder);
  queryBuilder.where = jest.fn().mockReturnValue(queryBuilder);
  queryBuilder.groupBy = jest.fn().mockReturnValue(queryBuilder);
  queryBuilder.getRawMany = jest.fn().mockResolvedValue(rows);

  const createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);
  const repository = {
    createQueryBuilder,
  } as unknown as Repository<ProductFeedback>;

  return {
    service: new ProductRatingAggregationService(repository),
    repository,
    createQueryBuilder,
    queryBuilder,
  };
};

describe('ProductRatingAggregationService', () => {
  it('returns all five numeric aggregates for one feedback', async () => {
    const { service } = createSubject([
      {
        productId: '76575',
        ratingsCount: '1',
        averageRating: '5.0000000000000000',
        effectivenessAverage: '5.0000000000000000',
        needsAverage: '5.0000000000000000',
        repurchaseAverage: '5.0000000000000000',
      },
    ]);

    await expect(service.getForProduct(76575)).resolves.toEqual({
      averageRating: 5,
      ratingsCount: 1,
      effectivenessAverage: 5,
      needsAverage: 5,
      repurchaseAverage: 5,
    });
  });

  it('returns independently rounded question averages for multiple feedbacks', async () => {
    const feedback = [
      { effectivenessRating: 5, needsRating: 4, repurchaseRating: 3 },
      { effectivenessRating: 3, needsRating: 5, repurchaseRating: 4 },
    ];
    const average = (field: keyof (typeof feedback)[number]) =>
      feedback.reduce((sum, item) => sum + item[field], 0) / feedback.length;
    const overallAverage =
      feedback.reduce(
        (sum, item) =>
          sum +
          (item.effectivenessRating +
            item.needsRating +
            item.repurchaseRating) /
            3,
        0,
      ) / feedback.length;
    const { service, queryBuilder } = createSubject([
      {
        productId: '123',
        ratingsCount: String(feedback.length),
        averageRating: String(overallAverage),
        effectivenessAverage: String(average('effectivenessRating')),
        needsAverage: String(average('needsRating')),
        repurchaseAverage: String(average('repurchaseRating')),
      },
    ]);

    await expect(service.getForProduct(123)).resolves.toEqual({
      averageRating: 4,
      ratingsCount: 2,
      effectivenessAverage: 4,
      needsAverage: 4.5,
      repurchaseAverage: 3.5,
    });
    expect(queryBuilder.addSelect).toHaveBeenCalledWith(
      'AVG(feedback.effectivenessRating)',
      'effectivenessAverage',
    );
    expect(queryBuilder.addSelect).toHaveBeenCalledWith(
      'AVG(feedback.needsRating)',
      'needsAverage',
    );
    expect(queryBuilder.addSelect).toHaveBeenCalledWith(
      'AVG(feedback.repurchaseRating)',
      'repurchaseAverage',
    );
  });

  it('returns zeroes when a product has no feedback', async () => {
    const { service } = createSubject([]);

    await expect(service.getForProduct(123)).resolves.toEqual({
      averageRating: 0,
      ratingsCount: 0,
      effectivenessAverage: 0,
      needsAverage: 0,
      repurchaseAverage: 0,
    });
  });

  it('uses one grouped query for a product page and matches detail summary values', async () => {
    const rows: RawSummary[] = [
      {
        productId: '76575',
        ratingsCount: '1',
        averageRating: '5',
        effectivenessAverage: '5',
        needsAverage: '5',
        repurchaseAverage: '5',
      },
    ];
    const detailSubject = createSubject(rows);
    const listSubject = createSubject(rows);

    const summary = await detailSubject.service.getForProduct(76575);
    const products = await listSubject.service.attachToProducts([
      { uid: 76575, ean: '8470001777430' },
      { uid: 100, ean: '4005808222520' },
      { uid: 100, ean: '4005808222520' },
    ]);

    expect(products[0]).toMatchObject(summary);
    expect(products[1]).toMatchObject({
      averageRating: 0,
      ratingsCount: 0,
      effectivenessAverage: 0,
      needsAverage: 0,
      repurchaseAverage: 0,
    });
    expect(listSubject.createQueryBuilder).toHaveBeenCalledTimes(1);
    expect(listSubject.queryBuilder.where).toHaveBeenCalledWith(
      'feedback.productId IN (:...productIds)',
      { productIds: [76575, 100] },
    );
  });

  it('does not cache summaries between requests', async () => {
    const subject = createSubject([]);
    subject.queryBuilder.getRawMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          productId: '123',
          ratingsCount: '1',
          averageRating: '4.6666666667',
          effectivenessAverage: '5',
          needsAverage: '4',
          repurchaseAverage: '5',
        },
      ]);

    await expect(subject.service.getForProduct(123)).resolves.toMatchObject({
      averageRating: 0,
      ratingsCount: 0,
    });
    await expect(subject.service.getForProduct(123)).resolves.toEqual({
      averageRating: 4.7,
      ratingsCount: 1,
      effectivenessAverage: 5,
      needsAverage: 4,
      repurchaseAverage: 5,
    });
    expect(subject.createQueryBuilder).toHaveBeenCalledTimes(2);
  });
});
