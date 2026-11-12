import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { IngredientStatus } from '../ingredients/entities/ingredient.entity';
import { Product } from '../products/entities/product.entity';
import { BeautySafeScoringService } from './beautysafe-scoring.service';

describe('BeautySafeScoringService', () => {
  const service = new BeautySafeScoringService(
    {} as Repository<Product>,
    { get: jest.fn().mockReturnValue('true') } as unknown as ConfigService,
  );

  it('does not publish an empty composition', () => {
    expect(service.assessOrderedComposition(1, [])).toEqual({
      productUid: 1,
      score: null,
      result: null,
      reason: 'NO_COMPOSITION',
    });
  });

  it('treats NEW ingredients as unrecognized', () => {
    const assessment = service.assessOrderedComposition(2, [
      {
        id: 1,
        name: 'Aqua',
        bsScore: 0,
        status: IngredientStatus.ACTIVE,
      },
      {
        id: 2,
        name: 'Unreviewed ingredient',
        bsScore: 0,
        status: IngredientStatus.NEW,
      },
    ]);

    expect(assessment).toMatchObject({
      productUid: 2,
      score: null,
      reason: 'LOW_RECOGNITION',
      result: {
        recognitionRate: 0.5,
        reliable: false,
        unrecognized: ['Unreviewed ingredient'],
      },
    });
  });

  it('publishes a valid calculated zero', () => {
    const assessment = service.assessOrderedComposition(3, [
      {
        id: 1,
        name: 'High risk 1',
        bsScore: 10,
        status: IngredientStatus.ACTIVE,
      },
      {
        id: 2,
        name: 'High risk 2',
        bsScore: 10,
        status: IngredientStatus.ACTIVE,
      },
      {
        id: 3,
        name: 'High risk 3',
        bsScore: 10,
        status: IngredientStatus.ACTIVE,
      },
      {
        id: 4,
        name: 'High risk 4',
        bsScore: 5,
        status: IngredientStatus.ACTIVE,
      },
      {
        id: 5,
        name: 'High risk 5',
        bsScore: 5,
        status: IngredientStatus.ACTIVE,
      },
      {
        id: 6,
        name: 'High risk 6',
        bsScore: 5,
        status: IngredientStatus.ACTIVE,
      },
      {
        id: 7,
        name: 'High risk 7',
        bsScore: 5,
        status: IngredientStatus.ACTIVE,
      },
    ]);

    expect(assessment).toMatchObject({
      productUid: 3,
      score: 0,
      reason: 'READY',
    });
  });

  it('finds affected product UIDs through product_ingredients', async () => {
    const query = jest
      .fn()
      .mockResolvedValue([{ productUid: '10' }, { productUid: '20' }]);
    const repository = {
      query,
    } as unknown as Repository<Product>;
    const lookupService = new BeautySafeScoringService(repository, {
      get: jest.fn().mockReturnValue('true'),
    } as unknown as ConfigService);

    await expect(lookupService.findAffectedProductUids(7)).resolves.toEqual([
      10, 20,
    ]);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('product_ingredients'),
      [[7]],
    );
  });
});
