import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { Story } from './entities/story.entity';
import { FirebaseStorageService } from '../storage/firebase-storage.service';

@Injectable()
export class StoriesService {
  private readonly logger = new Logger(StoriesService.name);

  constructor(
    @InjectRepository(Story)
    private storyRepository: Repository<Story>,
    private readonly storage: FirebaseStorageService,
  ) {}

  async create(createStoryDto: CreateStoryDto) {
    const story = this.storyRepository.create(createStoryDto);
    try {
      return await this.storyRepository.save(story);
    } catch (error) {
      await this.cleanup([
        createStoryDto.imageKey,
        ...(createStoryDto.videoKeys ?? []),
      ]);
      throw error;
    }
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
    if (!story) {
      await this.cleanup([
        updateStoryDto.imageKey,
        ...(updateStoryDto.videoKeys ?? []),
      ]);
      throw new NotFoundException('Story not found');
    }
    const previousKeys = [story.imageKey, ...(story.videoKeys ?? [])].filter(
      (key): key is string => Boolean(key),
    );
    Object.assign(story, updateStoryDto);
    const nextKeys = [story.imageKey, ...(story.videoKeys ?? [])].filter(
      (key): key is string => Boolean(key),
    );
    try {
      const saved = await this.storyRepository.save(story);
      await this.cleanup(previousKeys.filter((key) => !nextKeys.includes(key)));
      return saved;
    } catch (error) {
      await this.cleanup(nextKeys.filter((key) => !previousKeys.includes(key)));
      throw error;
    }
  }

  async remove(id: number) {
    const story = await this.findOne(id);
    if (!story) throw new NotFoundException('Story not found');
    const keys = [story.imageKey, ...(story.videoKeys ?? [])];
    const deleted = await this.storyRepository.remove(story);
    await this.cleanup(keys);
    return deleted;
  }

  private async cleanup(paths: Array<string | null | undefined>) {
    await Promise.all(
      paths
        .filter((path): path is string => Boolean(path))
        .map(async (path) => {
          try {
            await this.storage.deleteFile(path);
          } catch (error) {
            this.logger.error(
              `Firebase cleanup failed for story object ${path}`,
              error instanceof Error ? error.stack : String(error),
            );
          }
        }),
    );
  }
}
