import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Ingredient } from './entities/ingredient.entity';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';

@Injectable()
export class IngredientsService {
  constructor(
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
  ) {}
 async searchByName(query: string) {
    return this.ingredientRepository.find({
      where: { name: ILike(`${query}%`) },
      take: 10,
    });
  }
  create(createIngredientDto: CreateIngredientDto) {
    const ingredient = this.ingredientRepository.create(createIngredientDto);
    return this.ingredientRepository.save(ingredient);
  }

  findAll() {
    return this.ingredientRepository.find();
  }

  async findOne(id: number) {
    const ingredient = await this.ingredientRepository.findOne({ where: { id } });
    if (!ingredient) throw new NotFoundException('Ingredient not found');
    return ingredient;
  }

  async update(id: number, updateIngredientDto: UpdateIngredientDto) {
    const ingredient = await this.ingredientRepository.findOne({ where: { id } });
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
