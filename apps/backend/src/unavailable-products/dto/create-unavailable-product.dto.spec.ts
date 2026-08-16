import { validate } from 'class-validator';
import { CreateUnavailableProductDto } from './create-unavailable-product.dto';

const validateDto = (value: Partial<CreateUnavailableProductDto>) =>
  validate(Object.assign(new CreateUnavailableProductDto(), value));

describe('CreateUnavailableProductDto', () => {
  it('accepts one image without an EAN', async () => {
    const errors = await validateDto({
      imageUrls: ['https://example.com/front.jpg'],
    });
    expect(errors).toHaveLength(0);
  });

  it('accepts multiple images without an EAN', async () => {
    const errors = await validateDto({
      imageUrls: [
        'https://example.com/front.jpg',
        'https://example.com/back.jpg',
      ],
    });
    expect(errors).toHaveLength(0);
  });

  it('rejects an empty image list', async () => {
    const errors = await validateDto({ imageUrls: [] });
    expect(errors.some((error) => error.property === 'imageUrls')).toBe(true);
  });

  it('rejects invalid and duplicate image URLs', async () => {
    const invalid = await validateDto({ imageUrls: ['not-a-url'] });
    const duplicate = await validateDto({
      imageUrls: [
        'https://example.com/front.jpg',
        'https://example.com/front.jpg',
      ],
    });

    expect(invalid.some((error) => error.property === 'imageUrls')).toBe(true);
    expect(duplicate.some((error) => error.property === 'imageUrls')).toBe(
      true,
    );
  });
});
