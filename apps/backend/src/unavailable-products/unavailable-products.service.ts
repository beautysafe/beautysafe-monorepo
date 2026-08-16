import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { FirebaseStorageService } from '../storage/firebase-storage.service';
import { CreateUnavailableProductDto } from './dto/create-unavailable-product.dto';
import { UnavailableProductsQueryDto } from './dto/unavailable-products-query.dto';
import { UpdateUnavailableProductDto } from './dto/update-unavailable-product.dto';
import {
  UnavailableProduct,
  UnavailableProductStatus,
} from './entities/unavailable-product.entity';
import { SortOrder } from '../common/dto/pagination-query.dto';

@Injectable()
export class UnavailableProductsService {
  private readonly logger = new Logger(UnavailableProductsService.name);

  constructor(
    @InjectRepository(UnavailableProduct)
    private readonly unavailableProductsRepository: Repository<UnavailableProduct>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly storage: FirebaseStorageService,
  ) {}

  async create(userId: number, dto: CreateUnavailableProductDto) {
    const imageKeys = (dto.imageKeys ?? []).filter(Boolean);
    try {
      if (imageKeys.length > dto.imageUrls.length) {
        throw new BadRequestException(
          'imageKeys must be aligned with imageUrls',
        );
      }
      const submission = this.unavailableProductsRepository.create({
        ean: this.optionalText(dto.ean),
        productName: this.optionalText(dto.productName),
        brandName: this.optionalText(dto.brandName),
        notes: this.optionalText(dto.notes),
        imageUrls: dto.imageUrls,
        imageKeys,
        userId,
        status: UnavailableProductStatus.PENDING,
      });
      const saved = await this.unavailableProductsRepository.save(submission);
      return this.findOne(saved.id);
    } catch (error) {
      await this.cleanupFiles(imageKeys);
      throw error;
    }
  }

  async findAll(query: UnavailableProductsQueryDto) {
    const page = query.page;
    const limit = query.limit;
    const qb = this.baseQuery()
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy(
        'submission.createdAt',
        query.sort === SortOrder.OLDEST ? 'ASC' : 'DESC',
      );

    if (query.status) {
      qb.andWhere('submission.status = :status', { status: query.status });
    }

    const search = query.q?.trim();
    if (search) {
      qb.andWhere(
        new Brackets((where) => {
          where
            .where('submission.ean ILIKE :search', { search: `%${search}%` })
            .orWhere('submission.productName ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('submission.brandName ILIKE :search', {
              search: `%${search}%`,
            });
        }),
      );
    }

    const [items, total] = await qb.getManyAndCount();
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const submission = await this.baseQuery()
      .where('submission.id = :id', { id })
      .getOne();
    if (!submission) {
      throw new NotFoundException('Unavailable product submission not found');
    }
    return submission;
  }

  async update(id: number, dto: UpdateUnavailableProductDto) {
    const submission = await this.unavailableProductsRepository.findOne({
      where: { id },
    });
    if (!submission) {
      throw new NotFoundException('Unavailable product submission not found');
    }

    if (dto.resolvedProductId !== undefined) {
      if (dto.resolvedProductId === null) {
        submission.resolvedProductId = null;
      } else {
        const productExists = await this.productsRepository.exist({
          where: { uid: dto.resolvedProductId },
        });
        if (!productExists) throw new NotFoundException('Product not found');
        submission.resolvedProductId = dto.resolvedProductId;
      }
    }

    if (dto.status !== undefined) {
      submission.status = dto.status;
      submission.resolvedAt = [
        UnavailableProductStatus.ADDED,
        UnavailableProductStatus.REJECTED,
      ].includes(dto.status)
        ? new Date()
        : null;
    }

    await this.unavailableProductsRepository.save(submission);
    return this.findOne(id);
  }

  async remove(id: number) {
    const submission = await this.unavailableProductsRepository.findOne({
      where: { id },
    });
    if (!submission) {
      throw new NotFoundException('Unavailable product submission not found');
    }

    const imageKeys = submission.imageKeys ?? [];
    await this.unavailableProductsRepository.remove(submission);
    await this.cleanupFiles(imageKeys);
    return { deleted: true };
  }

  private baseQuery() {
    return this.unavailableProductsRepository
      .createQueryBuilder('submission')
      .leftJoin('submission.user', 'user')
      .addSelect(['user.id', 'user.email', 'user.fullName'])
      .leftJoin('submission.resolvedProduct', 'resolvedProduct')
      .addSelect([
        'resolvedProduct.uid',
        'resolvedProduct.ean',
        'resolvedProduct.name',
      ]);
  }

  private optionalText(value?: string) {
    const trimmed = value?.trim();
    return trimmed || null;
  }

  private async cleanupFiles(paths: string[]) {
    await Promise.all(
      paths.filter(Boolean).map(async (path) => {
        try {
          await this.storage.deleteFile(path);
        } catch (error) {
          this.logger.error(
            `Firebase cleanup failed for unavailable product object ${path}`,
            error instanceof Error ? error.stack : String(error),
          );
        }
      }),
    );
  }
}
