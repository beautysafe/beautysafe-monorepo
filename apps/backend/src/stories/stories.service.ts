import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { Story } from './entities/story.entity';

@Injectable()
export class StoriesService {
  constructor(
    @InjectRepository(Story)
    private storyRepository: Repository<Story>,
  ) {}

  create(createStoryDto: CreateStoryDto) {
    const story = this.storyRepository.create(createStoryDto);
    return this.storyRepository.save(story);
  }

  findAll() {
    return this.storyRepository.find();
  }

  async findOne(id: number) {
    const story = await this.storyRepository.findOne({ where: { id } });
    if (!story) throw new NotFoundException('Story not found');
    return story;
  }

  async update(id: number, updateStoryDto: UpdateStoryDto) {
    const story = await this.storyRepository.findOne({ where: { id } });
    if (!story) throw new NotFoundException('Story not found');
    Object.assign(story, updateStoryDto);
    return this.storyRepository.save(story);
  }

  async remove(id: number) {
    const story = await this.findOne(id);
    if (!story) throw new NotFoundException('Story not found');
    return this.storyRepository.remove(story);
  }
}
