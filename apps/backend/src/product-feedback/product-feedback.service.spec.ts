import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { ProductFeedback } from './entities/product-feedback.entity';
import { ProductFeedbackService } from './product-feedback.service';

describe('ProductFeedbackService', () => {
  it('upserts the same user/product row instead of creating duplicates', async () => {
    let stored: ProductFeedback | null = null;
    const upsertMock = jest.fn((value: Partial<ProductFeedback>) => {
      stored = {
        ...stored,
        ...value,
        id: stored?.id ?? 9,
        createdAt: stored?.createdAt ?? new Date('2026-08-16T10:00:00.000Z'),
        updatedAt: new Date('2026-08-16T10:05:00.000Z'),
      } as ProductFeedback;
      return Promise.resolve({});
    });
    const findOneMock = jest.fn(() => Promise.resolve(stored));
    const feedbackRepository = {
      upsert: upsertMock,
      findOne: findOneMock,
    } as unknown as Repository<ProductFeedback>;
    const productExistsMock = jest.fn(() => Promise.resolve(true));
    const productsRepository = {
      exist: productExistsMock,
    } as unknown as Repository<Product>;
    const service = new ProductFeedbackService(
      feedbackRepository,
      productsRepository,
    );

    const first = await service.upsert(7, 123, {
      effectivenessRating: 5,
      needsRating: 4,
      repurchaseRating: 5,
      comment: 'First',
    });
    const updated = await service.upsert(7, 123, {
      effectivenessRating: 4,
      needsRating: 4,
      repurchaseRating: 5,
      comment: 'Updated',
    });

    expect(first.id).toBe(9);
    expect(updated.id).toBe(9);
    expect(updated.comment).toBe('Updated');
    expect(upsertMock).toHaveBeenCalledTimes(2);
    expect(upsertMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ userId: 7, productId: 123 }),
      expect.objectContaining({ conflictPaths: ['userId', 'productId'] }),
    );
  });
});
