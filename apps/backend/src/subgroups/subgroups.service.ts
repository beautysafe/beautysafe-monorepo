import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from '../groups/entities/group.entity';
import { Journey } from '../journeys/entities/journey.entity';
import { ProductList } from '../product-lists/entities/product-list.entity';
import { CreateSubGroupDto } from './dto/create-subgroup.dto';
import { UpdateSubGroupDto } from './dto/update-subgroup.dto';
import { SubGroup } from './entities/subgroup.entity';
import { FirebaseStorageService } from '../storage/firebase-storage.service';

@Injectable()
export class SubgroupsService {
  private readonly logger = new Logger(SubgroupsService.name);

  constructor(
    @InjectRepository(SubGroup)
    private subgroupRepository: Repository<SubGroup>,
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(ProductList)
    private productListRepository: Repository<ProductList>,
    @InjectRepository(Journey)
    private journeyRepository: Repository<Journey>,
    private readonly storage: FirebaseStorageService,
  ) {}

  async create(groupId: number, createSubGroupDto: CreateSubGroupDto) {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
    });
    if (!group) {
      await this.cleanup(createSubGroupDto.imageKey);
      throw new NotFoundException('Group not found');
    }

    const subgroup = this.subgroupRepository.create({
      ...createSubGroupDto,
      group,
    });
    try {
      return await this.subgroupRepository.save(subgroup);
    } catch (error) {
      await this.cleanup(createSubGroupDto.imageKey);
      throw error;
    }
  }

  findAll() {
    return this.subgroupRepository.find({
      relations: ['group'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const subgroup = await this.subgroupRepository.findOne({
      where: { id },
      relations: ['group', 'productLists', 'journeys'],
    });
    if (!subgroup) throw new NotFoundException('SubGroup not found');
    return subgroup;
  }

  async findProductLists(id: number) {
    const subgroup = await this.subgroupRepository.findOne({ where: { id } });
    if (!subgroup) throw new NotFoundException('SubGroup not found');
    return this.productListRepository.find({
      where: { subgroup: { id } },
      order: { id: 'DESC' },
    });
  }

  async findJourneys(id: number) {
    const subgroup = await this.subgroupRepository.findOne({ where: { id } });
    if (!subgroup) throw new NotFoundException('SubGroup not found');
    return this.journeyRepository.find({
      where: { subgroup: { id } },
      order: { id: 'DESC' },
    });
  }

  async update(id: number, updateSubGroupDto: UpdateSubGroupDto) {
    const subgroup = await this.subgroupRepository.findOne({ where: { id } });
    if (!subgroup) {
      await this.cleanup(updateSubGroupDto.imageKey);
      throw new NotFoundException('SubGroup not found');
    }
    const previousKey = subgroup.imageKey;
    Object.assign(subgroup, updateSubGroupDto);
    try {
      const saved = await this.subgroupRepository.save(subgroup);
      if (previousKey && previousKey !== saved.imageKey)
        await this.cleanup(previousKey);
      return saved;
    } catch (error) {
      if (updateSubGroupDto.imageKey !== previousKey)
        await this.cleanup(updateSubGroupDto.imageKey);
      throw error;
    }
  }

  async remove(id: number) {
    const subgroup = await this.findOne(id);
    if (!subgroup) throw new NotFoundException('SubGroup not found');
    const deleted = await this.subgroupRepository.remove(subgroup);
    await this.cleanup(subgroup.imageKey);
    return deleted;
  }

  private async cleanup(storagePath?: string | null) {
    if (!storagePath) return;
    try {
      await this.storage.deleteFile(storagePath);
    } catch (error) {
      this.logger.error(
        `Firebase cleanup failed for subgroup object ${storagePath}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
