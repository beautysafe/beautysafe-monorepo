import { Repository } from 'typeorm';
import { Ingredient, IngredientStatus } from './entities/ingredient.entity';
import { IngredientsService } from './ingredients.service';
import { BeautySafeScoringService } from '../beautysafe-scoring/beautysafe-scoring.service';

const scoringService = {} as BeautySafeScoringService;

describe('IngredientsService', () => {
  it('resolves existing names and creates missing names as NEW in one lookup', async () => {
    const existing = {
      id: 1,
      name: 'Aqua',
      officialName: 'Water',
      score: 2,
      bs_score: 2,
      status: IngredientStatus.ACTIVE,
    } as Ingredient;
    const queryBuilder: Record<string, jest.Mock> = {};
    queryBuilder.where = jest.fn().mockReturnValue(queryBuilder);
    queryBuilder.getMany = jest.fn().mockResolvedValue([existing]);
    const create = jest.fn((value: Partial<Ingredient>) => value as Ingredient);
    const save = jest.fn().mockResolvedValue([
      {
        id: 2,
        name: 'New preservative',
        officialName: 'New preservative',
        score: 0,
        bs_score: 0,
        status: IngredientStatus.NEW,
      },
    ]);
    const createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);
    const repository = {
      createQueryBuilder,
      create,
      save,
    } as unknown as Repository<Ingredient>;
    const service = new IngredientsService(repository, scoringService);

    await expect(
      service.resolveNames([' aqua ', 'New preservative', 'NEW PRESERVATIVE']),
    ).resolves.toEqual([
      existing,
      expect.objectContaining({
        name: 'New preservative',
        officialName: 'New preservative',
        score: 0,
        bs_score: 0,
        status: IngredientStatus.NEW,
      }),
    ]);
    expect(createQueryBuilder).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({
      name: 'New preservative',
      officialName: 'New preservative',
      score: 0,
      bs_score: 0,
      status: IngredientStatus.NEW,
    });
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('filters the normal ingredient list to ACTIVE rows', async () => {
    const find = jest.fn().mockResolvedValue([]);
    const repository = {
      find,
    } as unknown as Repository<Ingredient>;
    const service = new IngredientsService(repository, scoringService);

    await service.findAll(2, 20);

    expect(find).toHaveBeenCalledWith({
      where: { status: IngredientStatus.ACTIVE },
      order: { id: 'ASC' },
      skip: 20,
      take: 20,
    });
  });

  it('supports searching by official name without requiring the ingredient name', async () => {
    const find = jest.fn().mockResolvedValue([]);
    const repository = {
      find,
    } as unknown as Repository<Ingredient>;
    const service = new IngredientsService(repository, scoringService);

    await service.searchIngredients(undefined, 'AQUA', IngredientStatus.ACTIVE);

    const calls = find.mock.calls as unknown as Array<
      [{ where: Record<string, unknown> }]
    >;
    const options = calls[0][0];
    expect(options.where.officialName).toBeDefined();
    expect(options.where.name).toBeUndefined();
    expect(options.where.status).toBe(IngredientStatus.ACTIVE);
    expect(options).toEqual(
      expect.objectContaining({
        order: { officialName: 'ASC', name: 'ASC' },
        take: 10,
      }),
    );
  });

  it('schedules affected products when bs_score changes', async () => {
    const ingredient = {
      id: 10,
      name: 'Ingredient',
      officialName: 'INGREDIENT',
      score: 0,
      bs_score: 0,
      status: IngredientStatus.ACTIVE,
    } as Ingredient;
    const repository = {
      findOne: jest.fn().mockResolvedValue(ingredient),
      save: jest.fn((value: Ingredient) => Promise.resolve(value)),
    } as unknown as Repository<Ingredient>;
    const scheduleIngredientRecalculation = jest.fn();
    const scoring = {
      scheduleIngredientRecalculation,
    } as unknown as BeautySafeScoringService;
    const service = new IngredientsService(repository, scoring);

    await service.update(10, { bs_score: 5 });

    expect(scheduleIngredientRecalculation).toHaveBeenCalledWith(10);
  });
});
