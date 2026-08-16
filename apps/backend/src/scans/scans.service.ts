import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { CreateProductScanDto } from './dto/create-product-scan.dto';
import { ProductScansQueryDto } from './dto/product-scans-query.dto';
import { ProductScan } from './entities/product-scan.entity';

@Injectable()
export class ScansService {
  constructor(
    @InjectRepository(ProductScan)
    private readonly scansRepository: Repository<ProductScan>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async record(userId: number, dto: CreateProductScanDto) {
    const product = await this.productsRepository.findOne({
      where: { uid: dto.productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    const scan = this.scansRepository.create({
      userId,
      productId: product.uid,
      ean: product.ean,
    });
    const saved = await this.scansRepository.save(scan);
    return {
      id: saved.id,
      productId: saved.productId,
      ean: saved.ean,
      scannedAt: saved.scannedAt,
    };
  }

  async findMine(userId: number, query: ProductScansQueryDto) {
    const page = query.page;
    const limit = query.limit;
    const [items, total] = await this.scansRepository.findAndCount({
      where: { userId },
      relations: {
        product: {
          brand: true,
          images: true,
        },
      },
      order: { scannedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: items.map((scan) => ({
        id: scan.id,
        scannedAt: scan.scannedAt,
        product: {
          uid: scan.product!.uid,
          ean: scan.product!.ean,
          name: scan.product!.name,
          brand: {
            id: scan.product!.brand.id,
            name: scan.product!.brand.name,
          },
          image:
            scan.product!.images?.[0]?.thumbnail ??
            scan.product!.images?.[0]?.image ??
            null,
        },
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      totalScans: total,
    };
  }

  async getMyStats(userId: number) {
    const raw = await this.scansRepository
      .createQueryBuilder('scan')
      .select('COUNT(scan.id)', 'totalScans')
      .addSelect('COUNT(DISTINCT scan.productId)', 'uniqueProducts')
      .where('scan.userId = :userId', { userId })
      .getRawOne<{ totalScans: string; uniqueProducts: string }>();

    return {
      totalScans: Number(raw?.totalScans ?? 0),
      uniqueProducts: Number(raw?.uniqueProducts ?? 0),
    };
  }
}
