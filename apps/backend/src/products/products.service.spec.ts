import { Repository } from 'typeorm';
import { Brand } from '../brands/entities/brand.entity';
import { Category } from '../categories/entities/category.entity';
import { Flag } from '../flags/entities/flag.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { ProductFeedback } from '../product-feedback/entities/product-feedback.entity';
import { FirebaseStorageService } from '../storage/firebase-storage.service';
import { SubCategory } from '../subcategories/entities/subcategory.entity';
import { SubSubCategory } from '../subsubcategories/entities/subsubcategory.entity';
import { ProductImage } from './entities/product-image.entity';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';

describe('ProductsService rating integration', () => {
  it('handles a zero-feedback product and an empty flag page', async () => {
    const product = { uid: 123, ean: '4005808222520' } as Product;
    const productQueryBuilder: Record<string, jest.Mock> = {};
    productQueryBuilder.leftJoinAndSelect = jest
      .fn()
      .mockReturnValue(productQueryBuilder);
    productQueryBuilder.where = jest.fn().mockReturnValue(productQueryBuilder);
    productQueryBuilder.getOne = jest.fn().mockResolvedValue(product);
    const flagQueryBuilder: Record<string, jest.Mock> = {};
    flagQueryBuilder.innerJoin = jest.fn().mockReturnValue(flagQueryBuilder);
    flagQueryBuilder.select = jest.fn().mockReturnValue(flagQueryBuilder);
    flagQueryBuilder.orderBy = jest.fn().mockReturnValue(flagQueryBuilder);
    flagQueryBuilder.offset = jest.fn().mockReturnValue(flagQueryBuilder);
    flagQueryBuilder.limit = jest.fn().mockReturnValue(flagQueryBuilder);
    flagQueryBuilder.getRawMany = jest.fn().mockResolvedValue([]);
    const feedbackQueryBuilder: Record<string, jest.Mock> = {};
    feedbackQueryBuilder.select = jest
      .fn()
      .mockReturnValue(feedbackQueryBuilder);
    feedbackQueryBuilder.addSelect = jest
      .fn()
      .mockReturnValue(feedbackQueryBuilder);
    feedbackQueryBuilder.where = jest
      .fn()
      .mockReturnValue(feedbackQueryBuilder);
    feedbackQueryBuilder.groupBy = jest
      .fn()
      .mockReturnValue(feedbackQueryBuilder);
    feedbackQueryBuilder.getRawMany = jest.fn().mockResolvedValue([]);

    const productsRepository = {
      createQueryBuilder: jest
        .fn()
        .mockReturnValueOnce(productQueryBuilder)
        .mockReturnValueOnce(flagQueryBuilder),
    } as unknown as Repository<Product>;
    const feedbackRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(feedbackQueryBuilder),
    } as unknown as Repository<ProductFeedback>;
    const emptyRepository = {} as Repository<never>;
    const flagsRepository = {
      exist: jest.fn().mockResolvedValue(true),
    } as unknown as Repository<Flag>;
    const service = new ProductsService(
      productsRepository,
      emptyRepository as Repository<Brand>,
      emptyRepository as Repository<Category>,
      emptyRepository as Repository<SubCategory>,
      emptyRepository as Repository<SubSubCategory>,
      emptyRepository as Repository<Ingredient>,
      flagsRepository,
      emptyRepository as Repository<ProductImage>,
      feedbackRepository,
      {} as FirebaseStorageService,
    );

    await expect(service.findByEan('4005808222520')).resolves.toMatchObject({
      uid: 123,
      averageRating: 0,
      ratingsCount: 0,
    });
    await expect(service.findByFlag(1, 1, 10)).resolves.toEqual({
      data: [],
      page: 1,
      limit: 10,
      hasMore: false,
    });
  });
});
