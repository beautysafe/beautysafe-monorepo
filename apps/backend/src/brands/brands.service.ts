import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
  ) {}
  async searchByName(query: string) {
    return this.brandRepository.find({
      where: { name: ILike(`${query}%`) },
      take: 10,
    });
  }
  create(createBrandDto: CreateBrandDto) {
    const brand = this.brandRepository.create(createBrandDto);
    return this.brandRepository.save(brand);
  }

  findAll(page = 1, limit = 100) {
    const skip = (page - 1) * limit;

    return this.brandRepository.find({
      skip,
      take: limit,
    });
  }

  findOne(id: number) {
    return this.brandRepository.findOne({ where: { id } });
  }

  async update(id: number, updateBrandDto: UpdateBrandDto) {
    await this.brandRepository.update(id, updateBrandDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const brand = await this.findOne(id);
    if (!brand) throw new NotFoundException('Brand not found');
    return this.brandRepository.remove(brand);
  }
}
