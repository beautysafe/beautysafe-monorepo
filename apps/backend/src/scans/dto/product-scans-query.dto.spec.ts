import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ProductScansQueryDto } from './product-scans-query.dto';

describe('ProductScansQueryDto', () => {
  it('accepts and transforms page=1&limit=6', async () => {
    const dto = plainToInstance(ProductScansQueryDto, {
      page: '1',
      limit: '6',
    });

    expect(await validate(dto)).toHaveLength(0);
    expect(dto).toMatchObject({ page: 1, limit: 6 });
  });

  it('rejects non-numeric pagination values', async () => {
    const dto = plainToInstance(ProductScansQueryDto, {
      page: 'one',
      limit: 'six',
    });

    await expect(validate(dto)).resolves.not.toHaveLength(0);
  });
});
