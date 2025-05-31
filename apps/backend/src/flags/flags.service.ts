import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flag } from './entities/flag.entity';
import { CreateFlagDto } from './dto/create-flag.dto';
import { UpdateFlagDto } from './dto/update-flag.dto';

@Injectable()
export class FlagsService {
  constructor(
    @InjectRepository(Flag)
    private flagRepository: Repository<Flag>,
  ) {}

  create(createFlagDto: CreateFlagDto) {
    const flag = this.flagRepository.create(createFlagDto);
    return this.flagRepository.save(flag);
  }

  findAll() {
    return this.flagRepository.find();
  }

  findOne(id: number) {
    return this.flagRepository.findOne({ where: { id } });
  }

  async update(id: number, updateFlagDto: UpdateFlagDto) {
    await this.flagRepository.update(id, updateFlagDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const flag = await this.findOne(id);
    if (!flag) throw new NotFoundException('Flag not found');
    return this.flagRepository.remove(flag);
  }
}
