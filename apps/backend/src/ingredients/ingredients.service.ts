import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Ingredient, IngredientStatus } from './entities/ingredient.entity';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { BeautySafeScoringService } from '../beautysafe-scoring/beautysafe-scoring.service';
import { IngredientSearchQueryDto } from './dto/ingredient-search-query.dto';
import { IngredientSearchResponseDto } from './dto/ingredient-search-response.dto';
import { ResolveIngredientsResponseDto } from './dto/resolve-ingredients-response.dto';

@Injectable()
export class IngredientsService {
  constructor(
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
    private readonly beautySafeScoring: BeautySafeScoringService,
  ) {}
  async searchByName(query: string, status?: IngredientStatus) {
    return (await this.search({ name: query, status })).items;
  }

  async searchIngredients(
    nameQuery?: string,
    officialNameQuery?: string,
    status?: IngredientStatus,
  ) {
    return (
      await this.search({
        name: nameQuery,
        officialName: officialNameQuery,
        status,
      })
    ).items;
  }

  async search(
    filters: IngredientSearchQueryDto,
  ): Promise<IngredientSearchResponseDto> {
    const q = filters.q?.trim();
    const name = filters.name?.trim();
    const officialName = filters.officialName?.trim();
    const page = Math.max(filters.page ?? 1, 1);
    const limit = Math.min(Math.max(filters.limit ?? 10, 1), 100);

    if (!q && !name && !officialName) {
      return { items: [], total: 0, page, limit, totalPages: 0 };
    }

    const queryBuilder = this.ingredientRepository
      .createQueryBuilder('ingredient')
      .where('1 = 1');

    if (filters.status) {
      queryBuilder.andWhere('ingredient.status = :status', {
        status: filters.status,
      });
    }

    if (q) {
      queryBuilder
        .andWhere(
          new Brackets((search) => {
            search
              .where('ingredient.name ILIKE :partialSearch')
              .orWhere('ingredient."officialName" ILIKE :partialSearch');
          }),
        )
        .setParameter('partialSearch', `%${q}%`)
        .addSelect(
          `CASE
             WHEN LOWER(ingredient.name) = LOWER(:exactSearch)
               OR LOWER(ingredient."officialName") = LOWER(:exactSearch)
             THEN 0 ELSE 1
           END`,
          'match_priority',
        )
        .setParameter('exactSearch', q)
        .orderBy('match_priority', 'ASC');
    } else {
      if (name) {
        queryBuilder.andWhere('ingredient.name ILIKE :nameSearch', {
          nameSearch: `${name}%`,
        });
      }
      if (officialName) {
        queryBuilder.andWhere(
          'ingredient."officialName" ILIKE :officialNameSearch',
          { officialNameSearch: `${officialName}%` },
        );
      }
    }

    queryBuilder
      .addOrderBy('ingredient."officialName"', 'ASC')
      .addOrderBy('ingredient.name', 'ASC')
      .addOrderBy('ingredient.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
  create(createIngredientDto: CreateIngredientDto) {
    const ingredient = this.ingredientRepository.create(createIngredientDto);
    return this.ingredientRepository.save(ingredient);
  }

  async findAll(page = 1, limit = 100, status = IngredientStatus.ACTIVE) {
    const skip = (page - 1) * limit;
    return this.ingredientRepository.find({
      where: { status },
      order: { id: 'ASC' },
      skip,
      take: limit,
    });
  }

  async resolveNames(names: string[]): Promise<ResolveIngredientsResponseDto> {
    const normalizedNames: Array<[string, string]> = [];
    const seenNames = new Set<string>();
    for (const rawName of names) {
      const originalName = rawName.trim();
      const normalizedName = originalName.toLocaleLowerCase();
      if (originalName && !seenNames.has(normalizedName)) {
        seenNames.add(normalizedName);
        normalizedNames.push([normalizedName, originalName]);
      }
    }

    if (!normalizedNames.length) {
      return {
        ingredients: [],
        existingCount: 0,
        newCount: 0,
        ambiguous: [],
      };
    }

    const normalizedValues = normalizedNames.map(([normalized]) => normalized);
    return this.ingredientRepository.manager.transaction(async (manager) => {
      await manager.query(
        `SELECT pg_advisory_xact_lock(hashtext(lock_name))
         FROM unnest($1::text[]) AS locks(lock_name)
         ORDER BY lock_name`,
        [[...normalizedValues].sort()],
      );

      const repository = manager.getRepository(Ingredient);
      const existing = await repository
        .createQueryBuilder('ingredient')
        .where(
          new Brackets((match) => {
            match
              .where('LOWER(TRIM(ingredient.name)) IN (:...normalizedNames)', {
                normalizedNames: normalizedValues,
              })
              .orWhere(
                'LOWER(TRIM(ingredient."officialName")) IN (:...normalizedNames)',
                { normalizedNames: normalizedValues },
              );
          }),
        )
        .orderBy('ingredient.id', 'ASC')
        .getMany();

      const matchesByInput = new Map<string, Map<number, Ingredient>>(
        normalizedValues.map((value) => [value, new Map()]),
      );
      existing.forEach((ingredient) => {
        const aliases = new Set([
          ingredient.name.trim().toLocaleLowerCase(),
          ingredient.officialName.trim().toLocaleLowerCase(),
        ]);
        aliases.forEach((alias) => {
          matchesByInput.get(alias)?.set(ingredient.id, ingredient);
        });
      });

      const ambiguous = normalizedNames.flatMap(([normalized, input]) => {
        const matches = Array.from(
          matchesByInput.get(normalized)?.values() ?? [],
        );
        return matches.length > 1 ? [{ input, matches }] : [];
      });
      const ambiguousInputs = new Set(
        ambiguous.map((entry) => entry.input.trim().toLocaleLowerCase()),
      );
      const missing = normalizedNames
        .filter(([normalized]) => {
          const matches = matchesByInput.get(normalized);
          return !ambiguousInputs.has(normalized) && !matches?.size;
        })
        .map(([normalized, original]) => ({
          normalized,
          ingredient: repository.create({
            name: original,
            officialName: original,
            score: 0,
            bs_score: 0,
            status: IngredientStatus.NEW,
          }),
        }));

      const created = missing.length
        ? await repository.save(missing.map((entry) => entry.ingredient))
        : [];
      const createdByInput = new Map(
        missing.map((entry, index) => [entry.normalized, created[index]]),
      );
      const ingredients: Ingredient[] = [];
      const seenIds = new Set<number>();
      let existingCount = 0;
      let newCount = 0;
      normalizedNames.forEach(([normalized]) => {
        if (ambiguousInputs.has(normalized)) return;
        const existingIngredient = Array.from(
          matchesByInput.get(normalized)?.values() ?? [],
        )[0];
        const ingredient = existingIngredient ?? createdByInput.get(normalized);
        if (!ingredient || seenIds.has(ingredient.id)) return;
        seenIds.add(ingredient.id);
        ingredients.push(ingredient);
        if (existingIngredient) existingCount += 1;
        else newCount += 1;
      });

      return { ingredients, existingCount, newCount, ambiguous };
    });
  }

  async findOne(id: number) {
    const ingredient = await this.ingredientRepository.findOne({
      where: { id },
    });
    if (!ingredient) throw new NotFoundException('Ingredient not found');
    return ingredient;
  }

  async update(id: number, updateIngredientDto: UpdateIngredientDto) {
    const ingredient = await this.ingredientRepository.findOne({
      where: { id },
    });
    if (!ingredient) throw new NotFoundException('Ingredient not found');
    const scoreChanged =
      updateIngredientDto.bs_score !== undefined &&
      updateIngredientDto.bs_score !== ingredient.bs_score;
    const statusChanged =
      updateIngredientDto.status !== undefined &&
      updateIngredientDto.status !== ingredient.status;
    Object.assign(ingredient, updateIngredientDto);
    const savedIngredient = await this.ingredientRepository.save(ingredient);
    if (scoreChanged || statusChanged) {
      this.beautySafeScoring.scheduleIngredientRecalculation(id);
    }
    return savedIngredient;
  }

  async remove(id: number) {
    const ingredient = await this.findOne(id);
    if (!ingredient) throw new NotFoundException('Ingredient not found');
    return this.ingredientRepository.remove(ingredient);
  }
}
