import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

describe('PaginationQueryDto', () => {
  it('transforms numeric query strings into numbers', async () => {
    const dto = plainToInstance(PaginationQueryDto, {
      page: '1',
      limit: '6',
    });

    expect(await validate(dto)).toHaveLength(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(6);
  });

  it('rejects malformed pagination instead of silently changing it', async () => {
    const dto = plainToInstance(PaginationQueryDto, {
      page: 'not-a-number',
      limit: '0',
    });

    await expect(validate(dto)).resolves.not.toHaveLength(0);
  });
});
