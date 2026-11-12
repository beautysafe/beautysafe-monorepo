import {
  Brackets,
  EntityManager,
  Repository,
  WhereExpressionBuilder,
} from 'typeorm';
import { BeautySafeScoringService } from '../beautysafe-scoring/beautysafe-scoring.service';
import { Ingredient, IngredientStatus } from './entities/ingredient.entity';
import { IngredientsService } from './ingredients.service';

const scoringService = {} as BeautySafeScoringService;

const ingredient = (
  id: number,
  name: string,
  officialName: string,
  status = IngredientStatus.ACTIVE,
) =>
  ({
    id,
    name,
    officialName,
    score: 0,
    bs_score: 0,
    status,
  }) as Ingredient;

const createQueryBuilder = (results: Ingredient[]) => {
  const queryBuilder: Record<string, jest.Mock> = {};
  for (const method of [
    'where',
    'andWhere',
    'orWhere',
    'setParameter',
    'addSelect',
    'orderBy',
    'addOrderBy',
    'skip',
    'take',
  ]) {
    queryBuilder[method] = jest.fn().mockReturnValue(queryBuilder);
  }
  queryBuilder.getMany = jest.fn().mockResolvedValue(results);
  queryBuilder.getManyAndCount = jest
    .fn()
    .mockResolvedValue([results, results.length]);
  return queryBuilder;
};

describe('IngredientsService', () => {
  it('searches name OR officialName with exact matches first and pagination', async () => {
    const aqua = ingredient(1, 'Eau', 'AQUA');
    const queryBuilder = createQueryBuilder([aqua]);
    const repository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    } as unknown as Repository<Ingredient>;
    const service = new IngredientsService(repository, scoringService);

    await expect(
      service.search({
        q: '  aqua  ',
        status: IngredientStatus.ACTIVE,
        page: 2,
        limit: 20,
      }),
    ).resolves.toEqual({
      items: [aqua],
      total: 1,
      page: 2,
      limit: 20,
      totalPages: 1,
    });

    expect(queryBuilder.setParameter).toHaveBeenCalledWith(
      'partialSearch',
      '%aqua%',
    );
    expect(queryBuilder.setParameter).toHaveBeenCalledWith(
      'exactSearch',
      'aqua',
    );
    expect(queryBuilder.addSelect).toHaveBeenCalledWith(
      expect.stringContaining('LOWER(ingredient."officialName")'),
      'match_priority',
    );
    expect(queryBuilder.skip).toHaveBeenCalledWith(20);
    expect(queryBuilder.take).toHaveBeenCalledWith(20);

    const andWhereCalls = queryBuilder.andWhere.mock.calls as unknown as Array<
      [unknown]
    >;
    const searchBrackets = andWhereCalls
      .map(([condition]) => condition)
      .find((condition) => condition instanceof Brackets) as Brackets;
    const orWhere = jest.fn();
    const where = jest.fn().mockReturnValue({ orWhere });
    searchBrackets.whereFactory({
      where,
      orWhere,
    } as unknown as WhereExpressionBuilder);
    expect(where).toHaveBeenCalledWith('ingredient.name ILIKE :partialSearch');
    expect(orWhere).toHaveBeenCalledWith(
      'ingredient."officialName" ILIKE :partialSearch',
    );
  });

  it('resolves exact name and officialName aliases without duplicate IDs', async () => {
    const aqua = ingredient(1, 'Eau', 'AQUA');
    aqua.score = 2;
    aqua.bs_score = 5;
    const glycerin = ingredient(2, 'Glycérine / Glycérol', 'GLYCERIN');
    const queryBuilder = createQueryBuilder([aqua, glycerin]);
    const create = jest.fn((value: Partial<Ingredient>) => value as Ingredient);
    const save = jest.fn((values: Ingredient[]) =>
      Promise.resolve(
        values.map((value, index) => ({ ...value, id: 100 + index })),
      ),
    );
    const transactionRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      create,
      save,
    } as unknown as Repository<Ingredient>;
    const manager = {
      query: jest.fn().mockResolvedValue([]),
      getRepository: jest.fn().mockReturnValue(transactionRepository),
    } as unknown as EntityManager;
    const transaction = jest.fn(
      (callback: (entityManager: EntityManager) => Promise<unknown>) =>
        callback(manager),
    );
    const repository = {
      manager: { transaction },
    } as unknown as Repository<Ingredient>;
    const service = new IngredientsService(repository, scoringService);

    await expect(
      service.resolveNames([
        ' AQUA ',
        'Eau',
        'glycerin',
        'Glycérine / Glycérol',
        'Unknown ingredient',
        'UNKNOWN INGREDIENT',
      ]),
    ).resolves.toEqual({
      ingredients: [
        aqua,
        glycerin,
        expect.objectContaining({
          id: 100,
          name: 'Unknown ingredient',
          officialName: 'Unknown ingredient',
          score: 0,
          bs_score: 0,
          status: IngredientStatus.NEW,
        }),
      ],
      existingCount: 2,
      newCount: 1,
      ambiguous: [],
    });
    expect(create).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledTimes(1);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(aqua).toMatchObject({ score: 2, bs_score: 5 });
  });

  it('reports ambiguous exact aliases instead of selecting or creating', async () => {
    const first = ingredient(1, 'Shared alias', 'FIRST');
    const second = ingredient(2, 'SECOND', 'Shared alias');
    const queryBuilder = createQueryBuilder([first, second]);
    const save = jest.fn();
    const transactionRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      create: jest.fn(),
      save,
    } as unknown as Repository<Ingredient>;
    const manager = {
      query: jest.fn().mockResolvedValue([]),
      getRepository: jest.fn().mockReturnValue(transactionRepository),
    } as unknown as EntityManager;
    const repository = {
      manager: {
        transaction: (
          callback: (entityManager: EntityManager) => Promise<unknown>,
        ) => callback(manager),
      },
    } as unknown as Repository<Ingredient>;
    const service = new IngredientsService(repository, scoringService);

    const result = await service.resolveNames(['Shared alias']);

    expect(result).toEqual({
      ingredients: [],
      existingCount: 0,
      newCount: 0,
      ambiguous: [{ input: 'Shared alias', matches: [first, second] }],
    });
    expect(save).not.toHaveBeenCalled();
  });

  it('filters the normal ingredient list to ACTIVE rows', async () => {
    const find = jest.fn().mockResolvedValue([]);
    const repository = { find } as unknown as Repository<Ingredient>;
    const service = new IngredientsService(repository, scoringService);

    await service.findAll(2, 20);

    expect(find).toHaveBeenCalledWith({
      where: { status: IngredientStatus.ACTIVE },
      order: { id: 'ASC' },
      skip: 20,
      take: 20,
    });
  });

  it('schedules affected products when bs_score changes', async () => {
    const existing = ingredient(10, 'Ingredient', 'INGREDIENT');
    const repository = {
      findOne: jest.fn().mockResolvedValue(existing),
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

  it('does not recalculate products when only the legacy score changes', async () => {
    const existing = ingredient(10, 'Ingredient', 'INGREDIENT');
    const repository = {
      findOne: jest.fn().mockResolvedValue(existing),
      save: jest.fn((value: Ingredient) => Promise.resolve(value)),
    } as unknown as Repository<Ingredient>;
    const scheduleIngredientRecalculation = jest.fn();
    const scoring = {
      scheduleIngredientRecalculation,
    } as unknown as BeautySafeScoringService;
    const service = new IngredientsService(repository, scoring);

    await service.update(10, { score: 5 });

    expect(scheduleIngredientRecalculation).not.toHaveBeenCalled();
  });

  it('schedules affected products when a NEW ingredient is confirmed', async () => {
    const existing = ingredient(
      10,
      'Ingredient',
      'INGREDIENT',
      IngredientStatus.NEW,
    );
    const repository = {
      findOne: jest.fn().mockResolvedValue(existing),
      save: jest.fn((value: Ingredient) => Promise.resolve(value)),
    } as unknown as Repository<Ingredient>;
    const scheduleIngredientRecalculation = jest.fn();
    const scoring = {
      scheduleIngredientRecalculation,
    } as unknown as BeautySafeScoringService;
    const service = new IngredientsService(repository, scoring);

    await service.update(10, { status: IngredientStatus.ACTIVE });

    expect(scheduleIngredientRecalculation).toHaveBeenCalledWith(10);
  });
});
