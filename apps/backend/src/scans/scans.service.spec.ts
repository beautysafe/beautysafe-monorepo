import { ScansService } from './scans.service';
import {
  DeepPartial,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { ProductScan } from './entities/product-scan.entity';
import { Product } from '../products/entities/product.entity';

describe('ScansService', () => {
  it('stores every repeated scan as an independent event', async () => {
    const saved: ProductScan[] = [];
    const scansRepository = {
      create: jest.fn(
        (value: DeepPartial<ProductScan>) => value as ProductScan,
      ),
      save: jest.fn((value: ProductScan) => {
        const row = {
          ...value,
          id: saved.length + 1,
          scannedAt: new Date('2026-08-16T10:00:00.000Z'),
        } as ProductScan;
        saved.push(row);
        return Promise.resolve(row);
      }),
    } as unknown as Repository<ProductScan>;
    const productsRepository = {
      findOne: jest.fn((options: FindOneOptions<Product>) => {
        const where = options.where as FindOptionsWhere<Product>;
        const uid = Number(where.uid);
        return Promise.resolve({
          uid,
          ean: uid === 1 ? '1111111111111' : '2222222222222',
        } as Product);
      }),
    } as unknown as Repository<Product>;
    const service = new ScansService(scansRepository, productsRepository);

    await service.record(7, { productId: 1 });
    await service.record(7, { productId: 1 });
    await service.record(7, { productId: 2 });

    expect(saved).toHaveLength(3);
    expect(saved.map((scan) => scan.productId)).toEqual([1, 1, 2]);
    expect(new Set(saved.map((scan) => scan.productId)).size).toBe(2);
  });

  it('always scopes history to the authenticated user ID', async () => {
    const findAndCountMock = jest.fn(() =>
      Promise.resolve([[], 0] as [ProductScan[], number]),
    );
    const scansRepository = {
      findAndCount: findAndCountMock,
    } as unknown as Repository<ProductScan>;
    const productsRepository = {} as Repository<Product>;
    const service = new ScansService(scansRepository, productsRepository);

    const result = await service.findMine(77, { page: 1, limit: 20 });

    expect(findAndCountMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 77 } }),
    );
    expect(result).toEqual({
      items: [],
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      totalScans: 0,
    });
  });

  it('returns zero totals when the authenticated user has no scans', async () => {
    const queryBuilder: Record<string, jest.Mock> = {};
    queryBuilder.select = jest.fn().mockReturnValue(queryBuilder);
    queryBuilder.addSelect = jest.fn().mockReturnValue(queryBuilder);
    queryBuilder.where = jest.fn().mockReturnValue(queryBuilder);
    queryBuilder.getRawOne = jest.fn().mockResolvedValue(undefined);
    const scansRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    } as unknown as Repository<ProductScan>;
    const service = new ScansService(
      scansRepository,
      {} as Repository<Product>,
    );

    await expect(service.getMyStats(77)).resolves.toEqual({
      totalScans: 0,
      uniqueProducts: 0,
    });
  });
});
