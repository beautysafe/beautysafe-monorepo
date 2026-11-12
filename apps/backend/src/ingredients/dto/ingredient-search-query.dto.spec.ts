import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { IngredientStatus } from '../entities/ingredient.entity';
import { IngredientSearchQueryDto } from './ingredient-search-query.dto';

describe('IngredientSearchQueryDto', () => {
  it('trims the unified query and transforms pagination values', async () => {
    const dto = plainToInstance(IngredientSearchQueryDto, {
      q: '  glycerin  ',
      status: IngredientStatus.ACTIVE,
      page: '2',
      limit: '20',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto).toMatchObject({
      q: 'glycerin',
      status: IngredientStatus.ACTIVE,
      page: 2,
      limit: 20,
    });
  });

  it('rejects invalid pagination', async () => {
    const dto = plainToInstance(IngredientSearchQueryDto, {
      q: 'AQUA',
      page: '0',
      limit: '101',
    });

    await expect(validate(dto)).resolves.toHaveLength(2);
  });
});
