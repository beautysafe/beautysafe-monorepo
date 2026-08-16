import { validate } from 'class-validator';
import { ProductType } from '../entities/product.entity';
import { CreateProductDto } from './create-product.dto';

const productDto = (imageUrls: string[]) =>
  Object.assign(new CreateProductDto(), {
    name: 'Product',
    validScore: 10,
    ean: '1234567890123',
    type: ProductType.ALL,
    brandId: 1,
    imageUrls,
    thumbnailUrls: imageUrls,
  });

describe('CreateProductDto image URLs', () => {
  it('accepts a valid direct image URL', async () => {
    expect(
      await validate(productDto(['https://example.com/product.jpg'])),
    ).toHaveLength(0);
  });

  it('rejects invalid or duplicate direct image URLs', async () => {
    const invalid = await validate(productDto(['not-a-url']));
    const duplicate = await validate(
      productDto([
        'https://example.com/product.jpg',
        'https://example.com/product.jpg',
      ]),
    );
    expect(invalid.some((error) => error.property === 'imageUrls')).toBe(true);
    expect(duplicate.some((error) => error.property === 'imageUrls')).toBe(
      true,
    );
  });
});
