import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { SubGroup } from '../subgroups/entities/subgroup.entity';
import { CreateProductListDto } from './dto/create-product-list.dto';
import { ProductListProductsDto } from './dto/product-list-products.dto';
import { UpdateProductListDto } from './dto/update-product-list.dto';
import { ProductList } from './entities/product-list.entity';

@Injectable()
export class ProductListsService {
  constructor(
    @InjectRepository(ProductList)
    private productListRepository: Repository<ProductList>,
    @InjectRepository(SubGroup)
    private subgroupRepository: Repository<SubGroup>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(subgroupId: number, createProductListDto: CreateProductListDto) {
    const subgroup = await this.subgroupRepository.findOne({
      where: { id: subgroupId },
    });
    if (!subgroup) throw new NotFoundException('SubGroup not found');

    const productList = this.productListRepository.create({
      ...createProductListDto,
      subgroup,
    });
    return this.productListRepository.save(productList);
  }

  async findOne(id: number) {
    const productList = await this.productListRepository.findOne({
      where: { id },
      relations: ['subgroup', 'products', 'products.images', 'products.brand'],
    });
    if (!productList) throw new NotFoundException('ProductList not found');
    return productList;
  }

  async findProducts(id: number, page = 1, limit = 20) {
    const productList = await this.productListRepository.findOne({ where: { id } });
    if (!productList) throw new NotFoundException('ProductList not found');

    const take = Math.min(Math.max(limit, 1), 50);
    const skip = (page - 1) * take;

    const [data, total] = await this.productRepository
      .createQueryBuilder('product')
      .innerJoin(
        'product_list_products',
        'productListProduct',
        'productListProduct."productUid" = product.uid',
      )
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.brand', 'brand')
      .where('productListProduct."productListId" = :id', { id })
      .orderBy('product.uid', 'DESC')
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return {
      data,
      page,
      limit: take,
      total,
      pageCount: Math.ceil(total / take),
      hasMore: page * take < total,
    };
  }

  async update(id: number, updateProductListDto: UpdateProductListDto) {
    const productList = await this.productListRepository.findOne({ where: { id } });
    if (!productList) throw new NotFoundException('ProductList not found');
    Object.assign(productList, updateProductListDto);
    return this.productListRepository.save(productList);
  }

  async addProducts(id: number, dto: ProductListProductsDto) {
    const productList = await this.productListRepository.findOne({
      where: { id },
      relations: ['products'],
    });
    if (!productList) throw new NotFoundException('ProductList not found');

    const eans = this.normalizeEans(dto);
    const products = await this.productRepository.find({
      where: { ean: In(eans) },
    });
    this.throwIfMissingProducts(eans, products);

    const existingUids = new Set((productList.products ?? []).map((product) => product.uid));
    productList.products = [
      ...(productList.products ?? []),
      ...products.filter((product) => !existingUids.has(product.uid)),
    ];

    return this.productListRepository.save(productList);
  }

  async removeProduct(id: number, productId: number) {
    const productList = await this.productListRepository.findOne({
      where: { id },
      relations: ['products'],
    });
    if (!productList) throw new NotFoundException('ProductList not found');

    productList.products = (productList.products ?? []).filter(
      (product) => product.uid !== productId,
    );
    return this.productListRepository.save(productList);
  }

  async remove(id: number) {
    const productList = await this.findOne(id);
    if (!productList) throw new NotFoundException('ProductList not found');
    return this.productListRepository.remove(productList);
  }

  private normalizeEans(dto: ProductListProductsDto) {
    const eans = [...(dto.eans ?? []), ...(dto.ean ? [dto.ean] : [])]
      .map((ean) => ean.trim())
      .filter(Boolean);

    if (!eans.length) throw new BadRequestException('EAN is required');
    return Array.from(new Set(eans));
  }

  private throwIfMissingProducts(eans: string[], products: Product[]) {
    const found = new Set(products.map((product) => product.ean));
    const missing = eans.filter((ean) => !found.has(ean));
    if (missing.length) {
      throw new NotFoundException(`Products not found for EANs: ${missing.join(', ')}`);
    }
  }
}
