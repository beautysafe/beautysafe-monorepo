import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { Product } from '../products/entities/product.entity';
import { SubGroup } from '../subgroups/entities/subgroup.entity';
import { CreateJourneyPhaseDto } from './dto/create-journey-phase.dto';
import { CreateJourneyDto } from './dto/create-journey.dto';
import { JourneyIngredientsDto } from './dto/journey-ingredients.dto';
import { JourneyPhaseProductsDto } from './dto/journey-phase-products.dto';
import { UpdateJourneyPhaseDto } from './dto/update-journey-phase.dto';
import { UpdateJourneyDto } from './dto/update-journey.dto';
import { JourneyPhase } from './entities/journey-phase.entity';
import { Journey } from './entities/journey.entity';

@Injectable()
export class JourneysService {
  constructor(
    @InjectRepository(Journey)
    private journeyRepository: Repository<Journey>,
    @InjectRepository(JourneyPhase)
    private journeyPhaseRepository: Repository<JourneyPhase>,
    @InjectRepository(SubGroup)
    private subgroupRepository: Repository<SubGroup>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
  ) {}

  async create(subgroupId: number, createJourneyDto: CreateJourneyDto) {
    const subgroup = await this.subgroupRepository.findOne({
      where: { id: subgroupId },
    });
    if (!subgroup) throw new NotFoundException('SubGroup not found');

    const journey = this.journeyRepository.create({
      ...createJourneyDto,
      subgroup,
    });
    return this.journeyRepository.save(journey);
  }

  async findOne(id: number) {
    const journey = await this.journeyRepository.findOne({
      where: { id },
      relations: [
        'subgroup',
        'phases',
        'phases.products',
        'phases.products.images',
        'phases.products.brand',
        'ingredients',
      ],
    });
    if (!journey) throw new NotFoundException('Journey not found');
    journey.phases = (journey.phases ?? []).sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
    return journey;
  }

  async update(id: number, updateJourneyDto: UpdateJourneyDto) {
    const journey = await this.journeyRepository.findOne({ where: { id } });
    if (!journey) throw new NotFoundException('Journey not found');
    Object.assign(journey, updateJourneyDto);
    return this.journeyRepository.save(journey);
  }

  async remove(id: number) {
    const journey = await this.findOne(id);
    if (!journey) throw new NotFoundException('Journey not found');
    return this.journeyRepository.remove(journey);
  }

  async createPhase(journeyId: number, createJourneyPhaseDto: CreateJourneyPhaseDto) {
    const journey = await this.journeyRepository.findOne({
      where: { id: journeyId },
    });
    if (!journey) throw new NotFoundException('Journey not found');

    const phase = this.journeyPhaseRepository.create({
      ...createJourneyPhaseDto,
      sortOrder: createJourneyPhaseDto.sortOrder ?? 0,
      journey,
    });
    return this.journeyPhaseRepository.save(phase);
  }

  async updatePhase(id: number, updateJourneyPhaseDto: UpdateJourneyPhaseDto) {
    const phase = await this.journeyPhaseRepository.findOne({ where: { id } });
    if (!phase) throw new NotFoundException('JourneyPhase not found');
    Object.assign(phase, updateJourneyPhaseDto);
    return this.journeyPhaseRepository.save(phase);
  }

  async removePhase(id: number) {
    const phase = await this.journeyPhaseRepository.findOne({
      where: { id },
      relations: ['products'],
    });
    if (!phase) throw new NotFoundException('JourneyPhase not found');
    return this.journeyPhaseRepository.remove(phase);
  }

  async addPhaseProducts(id: number, dto: JourneyPhaseProductsDto) {
    const phase = await this.journeyPhaseRepository.findOne({
      where: { id },
      relations: ['products'],
    });
    if (!phase) throw new NotFoundException('JourneyPhase not found');

    const eans = this.normalizeEans(dto);
    const products = await this.productRepository.find({
      where: { ean: In(eans) },
    });
    this.throwIfMissingProducts(eans, products);

    const existingUids = new Set((phase.products ?? []).map((product) => product.uid));
    phase.products = [
      ...(phase.products ?? []),
      ...products.filter((product) => !existingUids.has(product.uid)),
    ];

    return this.journeyPhaseRepository.save(phase);
  }

  async removePhaseProduct(id: number, productId: number) {
    const phase = await this.journeyPhaseRepository.findOne({
      where: { id },
      relations: ['products'],
    });
    if (!phase) throw new NotFoundException('JourneyPhase not found');

    phase.products = (phase.products ?? []).filter(
      (product) => product.uid !== productId,
    );
    return this.journeyPhaseRepository.save(phase);
  }

  async addIngredients(journeyId: number, dto: JourneyIngredientsDto) {
    const journey = await this.journeyRepository.findOne({
      where: { id: journeyId },
      relations: ['ingredients'],
    });
    if (!journey) throw new NotFoundException('Journey not found');

    const ingredientIds = this.normalizeIngredientIds(dto);
    const ingredients = await this.ingredientRepository.find({
      where: { id: In(ingredientIds) },
    });
    this.throwIfMissingIngredients(ingredientIds, ingredients);

    const existingIds = new Set((journey.ingredients ?? []).map((ingredient) => ingredient.id));
    journey.ingredients = [
      ...(journey.ingredients ?? []),
      ...ingredients.filter((ingredient) => !existingIds.has(ingredient.id)),
    ];

    return this.journeyRepository.save(journey);
  }

  async removeIngredient(journeyId: number, ingredientId: number) {
    const journey = await this.journeyRepository.findOne({
      where: { id: journeyId },
      relations: ['ingredients'],
    });
    if (!journey) throw new NotFoundException('Journey not found');

    journey.ingredients = (journey.ingredients ?? []).filter(
      (ingredient) => ingredient.id !== ingredientId,
    );
    return this.journeyRepository.save(journey);
  }

  private normalizeEans(dto: JourneyPhaseProductsDto) {
    const eans = [...(dto.eans ?? []), ...(dto.ean ? [dto.ean] : [])]
      .map((ean) => ean.trim())
      .filter(Boolean);

    if (!eans.length) throw new BadRequestException('EAN is required');
    return Array.from(new Set(eans));
  }

  private normalizeIngredientIds(dto: JourneyIngredientsDto) {
    const ingredientIds = [
      ...(dto.ingredientIds ?? []),
      ...(dto.ingredientId ? [dto.ingredientId] : []),
    ];

    if (!ingredientIds.length) {
      throw new BadRequestException('Ingredient is required');
    }
    return Array.from(new Set(ingredientIds));
  }

  private throwIfMissingProducts(eans: string[], products: Product[]) {
    const found = new Set(products.map((product) => product.ean));
    const missing = eans.filter((ean) => !found.has(ean));
    if (missing.length) {
      throw new NotFoundException(`Products not found for EANs: ${missing.join(', ')}`);
    }
  }

  private throwIfMissingIngredients(ingredientIds: number[], ingredients: Ingredient[]) {
    const found = new Set(ingredients.map((ingredient) => ingredient.id));
    const missing = ingredientIds.filter((id) => !found.has(id));
    if (missing.length) {
      throw new NotFoundException(`Ingredients not found: ${missing.join(', ')}`);
    }
  }
}
