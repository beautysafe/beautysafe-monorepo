import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubCategory } from './entities/subcategory.entity';
import { CreateSubCategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubCategoryDto } from './dto/update-subcategory.dto';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class SubcategoriesService {
  constructor(
    @InjectRepository(SubCategory)
    private subcategoryRepository: Repository<SubCategory>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createSubCategoryDto: CreateSubCategoryDto) {
    const category = await this.categoryRepository.findOne({ where: { id: createSubCategoryDto.categoryId } });
    if (!category) throw new NotFoundException('Category not found');
    const subcategory = this.subcategoryRepository.create({
      name: createSubCategoryDto.name,
      category,
    });
    return this.subcategoryRepository.save(subcategory);
  }

  findAll() {
    return this.subcategoryRepository.find({ relations: ['category', 'subsubcategories'] });
  }

  findOne(id: number) {
    return this.subcategoryRepository.findOne({ where: { id }, relations: ['category', 'subsubcategories'] });
  }

  async update(id: number, updateSubCategoryDto: UpdateSubCategoryDto) {
    const subcategory = await this.subcategoryRepository.findOne({ where: { id } });
    if (!subcategory) throw new NotFoundException('SubCategory not found');
    if (updateSubCategoryDto.categoryId) {
      const category = await this.categoryRepository.findOne({ where: { id: updateSubCategoryDto.categoryId } });
      if (!category) throw new NotFoundException('Category not found');
      subcategory.category = category;
    }
    Object.assign(subcategory, updateSubCategoryDto);
    return this.subcategoryRepository.save(subcategory);
  }

  async remove(id: number) {
    const subcategory = await this.findOne(id);
    if (!subcategory) throw new NotFoundException('SubCategory not found');
    return this.subcategoryRepository.remove(subcategory);
  }
}
