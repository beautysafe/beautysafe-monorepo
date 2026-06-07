import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from '../groups/entities/group.entity';
import { Journey } from '../journeys/entities/journey.entity';
import { ProductList } from '../product-lists/entities/product-list.entity';
import { CreateSubGroupDto } from './dto/create-subgroup.dto';
import { UpdateSubGroupDto } from './dto/update-subgroup.dto';
import { SubGroup } from './entities/subgroup.entity';

@Injectable()
export class SubgroupsService {
  constructor(
    @InjectRepository(SubGroup)
    private subgroupRepository: Repository<SubGroup>,
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(ProductList)
    private productListRepository: Repository<ProductList>,
    @InjectRepository(Journey)
    private journeyRepository: Repository<Journey>,
  ) {}

  async create(groupId: number, createSubGroupDto: CreateSubGroupDto) {
    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');

    const subgroup = this.subgroupRepository.create({
      ...createSubGroupDto,
      group,
    });
    return this.subgroupRepository.save(subgroup);
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
    if (!subgroup) throw new NotFoundException('SubGroup not found');
    Object.assign(subgroup, updateSubGroupDto);
    return this.subgroupRepository.save(subgroup);
  }

  async remove(id: number) {
    const subgroup = await this.findOne(id);
    if (!subgroup) throw new NotFoundException('SubGroup not found');
    return this.subgroupRepository.remove(subgroup);
  }
}
