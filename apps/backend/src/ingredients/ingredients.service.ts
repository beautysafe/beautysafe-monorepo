import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Ingredient, IngredientStatus } from './entities/ingredient.entity';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';

@Injectable()
export class IngredientsService {
  constructor(
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
  ) {}
  async searchByName(query: string, status?: IngredientStatus) {
    return this.searchIngredients(query, undefined, status);
  }

  async searchIngredients(
    nameQuery?: string,
    officialNameQuery?: string,
    status?: IngredientStatus,
  ) {
    const name = nameQuery?.trim();
    const officialName = officialNameQuery?.trim();
    if (!name && !officialName) return [];

    return this.ingredientRepository.find({
      where: {
        ...(name ? { name: ILike(`${name}%`) } : {}),
        ...(officialName ? { officialName: ILike(`${officialName}%`) } : {}),
        ...(status ? { status } : {}),
      },
      order: { officialName: 'ASC', name: 'ASC' },
      take: 10,
    });
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

  async resolveNames(names: string[]) {
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

    if (!normalizedNames.length) return [];

    const normalizedValues = normalizedNames.map(([normalized]) => normalized);
    const existing = await this.ingredientRepository
      .createQueryBuilder('ingredient')
      .where('LOWER(ingredient.name) IN (:...names)', {
        names: normalizedValues,
      })
      .getMany();

    const existingByName = new Map(
      existing.map((ingredient) => [
        ingredient.name.trim().toLocaleLowerCase(),
        ingredient,
      ]),
    );
    const missing = normalizedNames
      .filter(([normalized]) => !existingByName.has(normalized))
      .map(([, original]) =>
        this.ingredientRepository.create({
          name: original,
          officialName: original,
          score: 0,
          status: IngredientStatus.NEW,
        }),
      );

    const created = missing.length
      ? await this.ingredientRepository.save(missing)
      : [];
    const resolvedByName = new Map(
      [...existing, ...created].map((ingredient) => [
        ingredient.name.trim().toLocaleLowerCase(),
        ingredient,
      ]),
    );

    return normalizedNames
      .map(([normalized]) => resolvedByName.get(normalized))
      .filter((ingredient): ingredient is Ingredient => Boolean(ingredient));
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
    Object.assign(ingredient, updateIngredientDto);
    return this.ingredientRepository.save(ingredient);
  }

  async remove(id: number) {
    const ingredient = await this.findOne(id);
    if (!ingredient) throw new NotFoundException('Ingredient not found');
    return this.ingredientRepository.remove(ingredient);
  }
}
