import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { SortOrder } from '../common/dto/pagination-query.dto';
import { Product } from '../products/entities/product.entity';
import { CreateProductFeedbackDto } from './dto/create-product-feedback.dto';
import {
  AdminProductFeedbackQueryDto,
  ProductFeedbackQueryDto,
} from './dto/product-feedback-query.dto';
import { ProductFeedback } from './entities/product-feedback.entity';
import {
  calculateFeedbackAverage,
  roundRating,
} from './product-feedback.utils';

@Injectable()
export class ProductFeedbackService {
  constructor(
    @InjectRepository(ProductFeedback)
    private readonly feedbackRepository: Repository<ProductFeedback>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async upsert(
    userId: number,
    productId: number,
    dto: CreateProductFeedbackDto,
  ) {
    await this.ensureProduct(productId);
    const comment = dto.comment?.trim() || null;
    await this.feedbackRepository.upsert(
      {
        userId,
        productId,
        effectivenessRating: dto.effectivenessRating,
        needsRating: dto.needsRating,
        repurchaseRating: dto.repurchaseRating,
        comment,
      },
      {
        conflictPaths: ['userId', 'productId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );
    return this.findMine(userId, productId);
  }

  async findForProduct(productId: number, query: ProductFeedbackQueryDto) {
    await this.ensureProduct(productId);
    const page = query.page;
    const limit = query.limit;
    const [items, total] = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .leftJoin('feedback.user', 'user')
      .addSelect(['user.id', 'user.fullName'])
      .where('feedback.productId = :productId', { productId })
      .orderBy(
        'feedback.createdAt',
        query.sort === SortOrder.OLDEST ? 'ASC' : 'DESC',
      )
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return this.page(items, total, page, limit);
  }

  async findMine(userId: number, productId: number) {
    await this.ensureProduct(productId);
    const feedback = await this.feedbackRepository.findOne({
      where: { userId, productId },
    });
    if (!feedback) throw new NotFoundException('Feedback not found');
    return this.withAverage(feedback);
  }

  async removeMine(userId: number, productId: number) {
    const result = await this.feedbackRepository.delete({ userId, productId });
    if (!result.affected) throw new NotFoundException('Feedback not found');
    return { deleted: true };
  }

  async getSummary(productId: number) {
    await this.ensureProduct(productId);
    const raw = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .select('COUNT(feedback.id)', 'ratingsCount')
      .addSelect(
        'AVG((feedback.effectivenessRating + feedback.needsRating + feedback.repurchaseRating) / 3.0)',
        'averageRating',
      )
      .addSelect('AVG(feedback.effectivenessRating)', 'effectivenessAverage')
      .addSelect('AVG(feedback.needsRating)', 'needsAverage')
      .addSelect('AVG(feedback.repurchaseRating)', 'repurchaseAverage')
      .where('feedback.productId = :productId', { productId })
      .getRawOne<{
        ratingsCount: string;
        averageRating: string | null;
        effectivenessAverage: string | null;
        needsAverage: string | null;
        repurchaseAverage: string | null;
      }>();

    return {
      ratingsCount: Number(raw?.ratingsCount ?? 0),
      averageRating: this.roundRaw(raw?.averageRating),
      effectivenessAverage: this.roundRaw(raw?.effectivenessAverage),
      needsAverage: this.roundRaw(raw?.needsAverage),
      repurchaseAverage: this.roundRaw(raw?.repurchaseAverage),
    };
  }

  async findAllForAdmin(query: AdminProductFeedbackQueryDto) {
    const page = query.page;
    const limit = query.limit;
    const qb = this.feedbackRepository
      .createQueryBuilder('feedback')
      .leftJoin('feedback.user', 'user')
      .addSelect(['user.id', 'user.email', 'user.fullName'])
      .leftJoin('feedback.product', 'product')
      .addSelect(['product.uid', 'product.name', 'product.ean'])
      .orderBy(
        'feedback.createdAt',
        query.sort === SortOrder.OLDEST ? 'ASC' : 'DESC',
      )
      .skip((page - 1) * limit)
      .take(limit);

    if (query.productId) {
      qb.andWhere('feedback.productId = :productId', {
        productId: query.productId,
      });
    }

    const search = query.q?.trim();
    if (search) {
      qb.andWhere(
        new Brackets((where) => {
          where
            .where('product.name ILIKE :search', { search: `%${search}%` })
            .orWhere('product.ean ILIKE :search', { search: `%${search}%` })
            .orWhere('user.email ILIKE :search', { search: `%${search}%` })
            .orWhere('user.fullName ILIKE :search', {
              search: `%${search}%`,
            });
        }),
      );
    }

    const [items, total] = await qb.getManyAndCount();
    return this.page(items, total, page, limit);
  }

  async removeForAdmin(id: number) {
    const result = await this.feedbackRepository.delete({ id });
    if (!result.affected) throw new NotFoundException('Feedback not found');
    return { deleted: true };
  }

  private async ensureProduct(productId: number) {
    const exists = await this.productsRepository.exist({
      where: { uid: productId },
    });
    if (!exists) throw new NotFoundException('Product not found');
  }

  private page(
    items: ProductFeedback[],
    total: number,
    page: number,
    limit: number,
  ) {
    return {
      items: items.map((item) => this.withAverage(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private withAverage(feedback: ProductFeedback) {
    feedback.averageRating = roundRating(calculateFeedbackAverage(feedback));
    return feedback;
  }

  private roundRaw(value?: string | null) {
    return value === null || value === undefined
      ? 0
      : roundRating(Number(value));
  }
}
