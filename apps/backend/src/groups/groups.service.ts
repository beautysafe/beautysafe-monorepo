import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';
import { FirebaseStorageService } from '../storage/firebase-storage.service';

@Injectable()
export class GroupsService {
  private readonly logger = new Logger(GroupsService.name);

  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    private readonly storage: FirebaseStorageService,
  ) {}

  async create(createGroupDto: CreateGroupDto) {
    const group = this.groupRepository.create(createGroupDto);
    try {
      return await this.groupRepository.save(group);
    } catch (error) {
      await this.cleanup(createGroupDto.imageKey);
      throw error;
    }
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
    if (!group) {
      await this.cleanup(updateGroupDto.imageKey);
      throw new NotFoundException('Group not found');
    }
    const previousKey = group.imageKey;
    Object.assign(group, updateGroupDto);
    try {
      const saved = await this.groupRepository.save(group);
      if (previousKey && previousKey !== saved.imageKey)
        await this.cleanup(previousKey);
      return saved;
    } catch (error) {
      if (updateGroupDto.imageKey !== previousKey)
        await this.cleanup(updateGroupDto.imageKey);
      throw error;
    }
  }

  async remove(id: number) {
    const group = await this.findOne(id);
    if (!group) throw new NotFoundException('Group not found');
    const subgroupKeys = (group.subgroups ?? []).map(
      (subgroup) => subgroup.imageKey,
    );
    const deleted = await this.groupRepository.remove(group);
    await this.cleanup(group.imageKey);
    await Promise.all(subgroupKeys.map((key) => this.cleanup(key)));
    return deleted;
  }

  private async cleanup(storagePath?: string | null) {
    if (!storagePath) return;
    try {
      await this.storage.deleteFile(storagePath);
    } catch (error) {
      this.logger.error(
        `Firebase cleanup failed for group object ${storagePath}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
