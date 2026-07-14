import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { FirebaseStorageService } from '../storage/firebase-storage.service';
import { Product } from '../products/entities/product.entity';
import { BannersService } from './banners.service';
import { Banner } from './entities/banner.entity';

describe('BannersService', () => {
  let service: BannersService;
  let bannerRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    find: jest.Mock;
    remove: jest.Mock;
  };
  let productRepository: { find: jest.Mock };
  let storage: { deleteFile: jest.Mock };

  const product = (uid: number): Product =>
    ({
      uid,
      ean: `ean-${uid}`,
      name: `Product ${uid}`,
      images: [],
    }) as unknown as Product;

  const existingBanner = (overrides: Partial<Banner> = {}): Banner =>
    ({
      id: 1,
      title: null,
      image: 'https://example.com/banner.webp',
      imageKey: 'banners/2026/07/existing.webp',
      shortDescription: null,
      longDescriptionHtml: '<p>Long</p>',
      published: false,
      products: [product(1)],
      ...overrides,
    }) as Banner;

  beforeEach(() => {
    bannerRepository = {
      create: jest.fn((value: Partial<Banner>) => value as Banner),
      save: jest.fn((value: Banner) => Promise.resolve(value)),
      findOne: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
    };
    productRepository = { find: jest.fn() };
    storage = { deleteFile: jest.fn() };
    service = new BannersService(
      bannerRepository as unknown as Repository<Banner>,
      productRepository as unknown as Repository<Product>,
      storage as unknown as FirebaseStorageService,
    );
  });

  it('creates a banner without a title', async () => {
    const result = await service.create({
      image: 'https://example.com/banner.webp',
      longDescriptionHtml: '<p>Long</p>',
    });

    expect(result.title).toBeNull();
  });

  it('creates a banner without a short description', async () => {
    const result = await service.create({
      image: 'https://example.com/banner.webp',
      longDescriptionHtml: '<p>Long</p>',
    });

    expect(result.shortDescription).toBeNull();
  });

  it('defaults published to false', async () => {
    const result = await service.create({
      image: 'https://example.com/banner.webp',
      longDescriptionHtml: '<p>Long</p>',
    });

    expect(result.published).toBe(false);
  });

  it('creates a published banner', async () => {
    const result = await service.create({
      image: 'https://example.com/banner.webp',
      longDescriptionHtml: '<p>Long</p>',
      published: true,
    });

    expect(result.published).toBe(true);
  });

  it('updates published without changing the existing image', async () => {
    const banner = existingBanner();
    bannerRepository.findOne.mockResolvedValue(banner);

    const result = await service.update(1, { published: true });

    expect(result.published).toBe(true);
    expect(result.image).toBe('https://example.com/banner.webp');
    expect(result.imageKey).toBe('banners/2026/07/existing.webp');
    expect(storage.deleteFile).not.toHaveBeenCalled();
  });

  it('replaces product relations when productIds are provided', async () => {
    const banner = existingBanner();
    const replacements = [product(2), product(3)];
    bannerRepository.findOne.mockResolvedValue(banner);
    productRepository.find.mockResolvedValue(replacements);

    const result = await service.update(1, { productIds: [2, 3] });

    expect(result.products).toEqual(replacements);
  });

  it('clears product relations when productIds is empty', async () => {
    bannerRepository.findOne.mockResolvedValue(existingBanner());

    const result = await service.update(1, { productIds: [] });

    expect(result.products).toEqual([]);
    expect(productRepository.find).not.toHaveBeenCalled();
  });

  it('preserves product relations when productIds is omitted', async () => {
    const existingProducts = [product(1)];
    bannerRepository.findOne.mockResolvedValue(
      existingBanner({ products: existingProducts }),
    );

    const result = await service.update(1, { title: 'Updated' });

    expect(result.products).toBe(existingProducts);
    expect(productRepository.find).not.toHaveBeenCalled();
  });

  it('rejects missing product IDs with a clear BadRequestException', async () => {
    bannerRepository.findOne.mockResolvedValue(existingBanner());
    productRepository.find.mockResolvedValue([product(2)]);

    await expect(service.update(1, { productIds: [2, 9, 10] })).rejects.toEqual(
      new BadRequestException('Products not found for IDs: 9, 10'),
    );
  });

  it('normalizes duplicate product IDs', async () => {
    const products = [product(2), product(3)];
    productRepository.find.mockResolvedValue(products);

    const result = await service.create({
      image: 'https://example.com/banner.webp',
      longDescriptionHtml: '<p>Long</p>',
      productIds: [2, 2, 3, 3],
    });

    expect(result.products).toEqual(products);
    expect(result.products).toHaveLength(2);
  });
});
