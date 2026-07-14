import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Banner } from './entities/banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { Product } from '../products/entities/product.entity';
import { FirebaseStorageService } from '../storage/firebase-storage.service';
@Injectable()
export class BannersService {
  private readonly logger = new Logger(BannersService.name);

  constructor(
    @InjectRepository(Banner)
    private bannerRepository: Repository<Banner>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private readonly storage: FirebaseStorageService,
  ) {}

  async create(createBannerDto: CreateBannerDto) {
    try {
      const { productIds, ...bannerData } = createBannerDto;
      const products = await this.resolveProducts(productIds ?? []);
      const banner = this.bannerRepository.create({
        ...bannerData,
        title: bannerData.title?.trim() || null,
        shortDescription: bannerData.shortDescription || null,
        published: bannerData.published ?? false,
        products,
      });

      return await this.bannerRepository.save(banner);
    } catch (error) {
      await this.cleanup(createBannerDto.imageKey);
      throw error;
    }
  }

  findAll() {
    return this.bannerRepository.find({
      relations: ['products'],
    });
  }

  async findOne(id: number) {
    const banner = await this.bannerRepository.findOne({
      where: { id },
      relations: ['products', 'products.images'],
    });

    if (!banner) throw new NotFoundException('Banner not found');

    return banner;
  }

  async update(id: number, updateBannerDto: UpdateBannerDto) {
    const banner = await this.bannerRepository.findOne({
      where: { id },
      relations: ['products'],
    });
    if (!banner) {
      if (updateBannerDto.image && updateBannerDto.imageKey) {
        await this.cleanup(updateBannerDto.imageKey);
      }
      throw new NotFoundException('Banner not found');
    }

    const previousKey = banner.imageKey;
    const imageChanged =
      updateBannerDto.image !== undefined &&
      updateBannerDto.image !== banner.image;
    const { productIds, image, imageKey, ...bannerData } = updateBannerDto;

    try {
      if (productIds !== undefined) {
        banner.products = await this.resolveProducts(productIds);
      }

      Object.assign(banner, bannerData);
      if (bannerData.title !== undefined) {
        banner.title = bannerData.title?.trim() || null;
      }
      if (bannerData.shortDescription !== undefined) {
        banner.shortDescription = bannerData.shortDescription || null;
      }
      if (imageChanged) {
        banner.image = image as string;
        banner.imageKey = imageKey ?? null;
      }

      const saved = await this.bannerRepository.save(banner);
      if (imageChanged && previousKey && previousKey !== saved.imageKey) {
        await this.cleanup(previousKey);
      }
      return saved;
    } catch (error) {
      if (imageChanged && imageKey && imageKey !== previousKey) {
        await this.cleanup(imageKey);
      }
      throw error;
    }
  }

  async remove(id: number) {
    const banner = await this.findOne(id);
    if (!banner) throw new NotFoundException('Banner not found');
    const deleted = await this.bannerRepository.remove(banner);
    await this.cleanup(banner.imageKey);
    return deleted;
  }

  private async cleanup(storagePath?: string | null) {
    if (!storagePath) return;
    try {
      await this.storage.deleteFile(storagePath);
    } catch (error) {
      this.logger.error(
        `Firebase cleanup failed for banner object ${storagePath}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private async resolveProducts(productIds: number[]): Promise<Product[]> {
    const uniqueIds = [...new Set(productIds)];
    if (uniqueIds.length === 0) return [];

    const products = await this.productRepository.find({
      where: { uid: In(uniqueIds) },
      relations: ['images'],
    });
    const foundIds = new Set(products.map((product) => product.uid));
    const missingIds = uniqueIds.filter((uid) => !foundIds.has(uid));

    if (missingIds.length > 0) {
      throw new BadRequestException(
        `Products not found for IDs: ${missingIds.join(', ')}`,
      );
    }

    const productsById = new Map(
      products.map((product) => [product.uid, product]),
    );
    return uniqueIds.map((uid) => productsById.get(uid) as Product);
  }
}
