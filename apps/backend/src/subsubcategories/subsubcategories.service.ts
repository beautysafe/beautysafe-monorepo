import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubSubCategory } from './entities/subsubcategory.entity';
import { CreateSubSubCategoryDto } from './dto/create-subsubcategory.dto';
import { UpdateSubSubCategoryDto } from './dto/update-subsubcategory.dto';
import { SubCategory } from '../subcategories/entities/subcategory.entity';

@Injectable()
export class SubsubcategoriesService {
  constructor(
    @InjectRepository(SubSubCategory)
    private subsubcategoryRepository: Repository<SubSubCategory>,
    @InjectRepository(SubCategory)
    private subcategoryRepository: Repository<SubCategory>,
  ) {}

  async create(createDto: CreateSubSubCategoryDto) {
    const subcategory = await this.subcategoryRepository.findOne({ where: { id: createDto.subcategoryId } });
    if (!subcategory) throw new NotFoundException('SubCategory not found');
    const subsubcategory = this.subsubcategoryRepository.create({
      name: createDto.name,
      subcategory,
    });
    return this.subsubcategoryRepository.save(subsubcategory);
  }

  findAll() {
    return this.subsubcategoryRepository.find({ relations: ['subcategory'] });
  }

  findOne(id: number) {
    return this.subsubcategoryRepository.findOne({ where: { id }, relations: ['subcategory'] });
  }

  async update(id: number, updateDto: UpdateSubSubCategoryDto) {
    const subsubcategory = await this.subsubcategoryRepository.findOne({ where: { id } });
    if (!subsubcategory) throw new NotFoundException('SubSubCategory not found');
    if (updateDto.subcategoryId) {
      const subcategory = await this.subcategoryRepository.findOne({ where: { id: updateDto.subcategoryId } });
      if (!subcategory) throw new NotFoundException('SubCategory not found');
      subsubcategory.subcategory = subcategory;
    }
    Object.assign(subsubcategory, updateDto);
    return this.subsubcategoryRepository.save(subsubcategory);
  }

  async remove(id: number) {
    const subsubcategory = await this.findOne(id);
    if (!subsubcategory) throw new NotFoundException('SubSubCategory not found');
    return this.subsubcategoryRepository.remove(subsubcategory);
  }
}
