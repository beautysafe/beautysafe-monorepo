import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Family } from './entities/family.entity';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';

@Injectable()
export class FamiliesService {
  constructor(
    @InjectRepository(Family)
    private familyRepository: Repository<Family>,
  ) {}

  create(createFamilyDto: CreateFamilyDto) {
    const family = this.familyRepository.create(createFamilyDto);
    return this.familyRepository.save(family);
  }

  findAll() {
    return this.familyRepository.find();
  }

  findOne(id: number) {
    return this.familyRepository.findOne({ where: { id } });
  }

  async update(id: number, updateFamilyDto: UpdateFamilyDto) {
    await this.familyRepository.update(id, updateFamilyDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const family = await this.findOne(id);
    if (!family) throw new NotFoundException('Family not found');
    return this.familyRepository.remove(family);
  }
}
