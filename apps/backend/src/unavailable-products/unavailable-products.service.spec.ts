import { Repository } from 'typeorm';
import { SortOrder } from '../common/dto/pagination-query.dto';
import { Product } from '../products/entities/product.entity';
import { FirebaseStorageService } from '../storage/firebase-storage.service';
import { UnavailableProduct } from './entities/unavailable-product.entity';
import { UnavailableProductsService } from './unavailable-products.service';

describe('UnavailableProductsService', () => {
  it('returns an empty page when no submissions exist', async () => {
    const queryBuilder: Record<string, jest.Mock> = {};
    queryBuilder.leftJoin = jest.fn().mockReturnValue(queryBuilder);
    queryBuilder.addSelect = jest.fn().mockReturnValue(queryBuilder);
    queryBuilder.skip = jest.fn().mockReturnValue(queryBuilder);
    queryBuilder.take = jest.fn().mockReturnValue(queryBuilder);
    queryBuilder.orderBy = jest.fn().mockReturnValue(queryBuilder);
    queryBuilder.getManyAndCount = jest.fn().mockResolvedValue([[], 0]);
    const repository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    } as unknown as Repository<UnavailableProduct>;
    const service = new UnavailableProductsService(
      repository,
      {} as Repository<Product>,
      {} as FirebaseStorageService,
    );

    await expect(
      service.findAll({ page: 1, limit: 20, sort: SortOrder.NEWEST }),
    ).resolves.toEqual({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
  });
});
