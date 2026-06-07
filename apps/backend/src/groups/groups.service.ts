import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
  ) {}

  create(createGroupDto: CreateGroupDto) {
    const group = this.groupRepository.create(createGroupDto);
    return this.groupRepository.save(group);
  }

  findAll() {
    return this.groupRepository.find({
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['subgroups'],
    });
    if (!group) throw new NotFoundException('Group not found');
    return group;
  }

  async findSubgroups(id: number) {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['subgroups'],
    });
    if (!group) throw new NotFoundException('Group not found');
    return group.subgroups;
  }

  async update(id: number, updateGroupDto: UpdateGroupDto) {
    const group = await this.groupRepository.findOne({ where: { id } });
    if (!group) throw new NotFoundException('Group not found');
    Object.assign(group, updateGroupDto);
    return this.groupRepository.save(group);
  }

  async remove(id: number) {
    const group = await this.findOne(id);
    if (!group) throw new NotFoundException('Group not found');
    return this.groupRepository.remove(group);
  }
}
