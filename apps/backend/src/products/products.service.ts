import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Brackets } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Brand } from '../brands/entities/brand.entity';
import { SubSubCategory } from '../subsubcategories/entities/subsubcategory.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { Flag } from '../flags/entities/flag.entity';
import { ProductImage } from './entities/product-image.entity';
import { Category } from '../categories/entities/category.entity';
import { SubCategory } from '../subcategories/entities/subcategory.entity';
import { SearchProductsDto } from './dto/search-products.dto';
import { ParseArrayPipe, Query } from '@nestjs/common';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Brand)
    private brandsRepository: Repository<Brand>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(SubCategory)
    private subCategoriesRepository: Repository<SubCategory>,
    @InjectRepository(SubSubCategory)
    private subSubCategoriesRepository: Repository<SubSubCategory>,
    @InjectRepository(Ingredient)
    private ingredientsRepository: Repository<Ingredient>,
    @InjectRepository(Flag)
    private flagsRepository: Repository<Flag>,
    @InjectRepository(ProductImage)
    private productImagesRepository: Repository<ProductImage>,
  ) {}

  // Create Product
  async create(createProductDto: CreateProductDto) {
    const {
      name,
      validScore,
      ean,
      type,
      brandId,
      categoryId,
      subCategoryId,
      subSubCategoryId,
      imageUrls = [],
      thumbnailUrls = [],
      compositionIds = [],
      flagIds = [],
    } = createProductDto;

    const brand = await this.brandsRepository.findOne({
      where: { id: brandId },
    });
    if (!brand) throw new NotFoundException('Brand not found');

    let category: Category | null = null;
    let subCategory: SubCategory | null = null;
    let subSubCategory: SubSubCategory | null = null;

    if (categoryId) {
      category = await this.categoriesRepository.findOne({
        where: { id: categoryId },
      });
      if (!category) throw new NotFoundException('Category not found');
    }
    if (subCategoryId) {
      subCategory = await this.subCategoriesRepository.findOne({
        where: { id: subCategoryId },
      });
      if (!subCategory) throw new NotFoundException('SubCategory not found');
    }
    if (subSubCategoryId) {
      subSubCategory = await this.subSubCategoriesRepository.findOne({
        where: { id: subSubCategoryId },
      });
      if (!subSubCategory)
        throw new NotFoundException('SubSubCategory not found');
    }

    const composition =
      compositionIds.length > 0
        ? await this.ingredientsRepository.find({
            where: { id: In(compositionIds) },
          })
        : [];

    const flags =
      flagIds.length > 0
        ? await this.flagsRepository.find({ where: { id: In(flagIds) } })
        : [];

    const images: ProductImage[] = (imageUrls.length > 0 ? imageUrls : []).map(
      (imgUrl, i) => {
        return this.productImagesRepository.create({
          image: imgUrl,
          thumbnail: thumbnailUrls[i] || imgUrl,
        });
      },
    );

    const product = this.productsRepository.create({
      name,
      validScore,
      ean,
      type,
      brand,
      category,
      subCategory,
      subSubCategory,
      images,
      composition,
      flags,
    } as Partial<Product>);

    const savedProduct = await this.productsRepository.save(product);

    if (category) {
      category.totalProducts += 1;
      await this.categoriesRepository.save(category);
    }
    if (brand) {
      brand.totalProducts += 1;
      await this.brandsRepository.save(brand);
    }
    if (flagIds?.length) {
      await this.flagsRepository.increment(
        { id: In(flagIds) },
        'totalProducts',
        1,
      );
    }
    return savedProduct;
  }

  // Update Product
  async update(uid: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(uid);
    const originalCategoryId = product.category?.id;

    if (updateProductDto.brandId) {
      const brand = await this.brandsRepository.findOne({
        where: { id: updateProductDto.brandId },
      });
      if (!brand) throw new NotFoundException('Brand not found');
      product.brand = brand;
    }

    if (updateProductDto.categoryId !== undefined) {
      if (updateProductDto.categoryId === null) {
        product.category = null;
      } else {
        const newCategory = await this.categoriesRepository.findOne({
          where: { id: updateProductDto.categoryId },
        });
        if (!newCategory) throw new NotFoundException('Category not found');
        if (originalCategoryId && originalCategoryId !== newCategory.id) {
          const oldCategory = await this.categoriesRepository.findOne({
            where: { id: originalCategoryId },
          });
          if (oldCategory) {
            oldCategory.totalProducts = Math.max(
              0,
              oldCategory.totalProducts - 1,
            );
            await this.categoriesRepository.save(oldCategory);
          }
          newCategory.totalProducts += 1;
          await this.categoriesRepository.save(newCategory);
        }
        product.category = newCategory;
      }
    }

    if (updateProductDto.subCategoryId !== undefined) {
      if (updateProductDto.subCategoryId === null) {
        product.subCategory = null;
      } else {
        const subCategory = await this.subCategoriesRepository.findOne({
          where: { id: updateProductDto.subCategoryId },
        });
        if (!subCategory) throw new NotFoundException('SubCategory not found');
        product.subCategory = subCategory;
      }
    }

    if (updateProductDto.subSubCategoryId !== undefined) {
      if (updateProductDto.subSubCategoryId === null) {
        product.subSubCategory = null;
      } else {
        const subSubCategory = await this.subSubCategoriesRepository.findOne({
          where: { id: updateProductDto.subSubCategoryId },
        });
        if (!subSubCategory)
          throw new NotFoundException('SubSubCategory not found');
        product.subSubCategory = subSubCategory;
      }
    }

    if (updateProductDto.compositionIds) {
      product.composition = await this.ingredientsRepository.find({
        where: { id: In(updateProductDto.compositionIds) },
      });
    }

    if (updateProductDto.flagIds) {
      product.flags = await this.flagsRepository.find({
        where: { id: In(updateProductDto.flagIds) },
      });
    }

    if (updateProductDto.imageUrls || updateProductDto.thumbnailUrls) {
      await this.productImagesRepository.delete({ product: { uid } });
      const images: ProductImage[] = (updateProductDto.imageUrls ?? []).map(
        (imgUrl, i) => {
          return this.productImagesRepository.create({
            image: imgUrl,
            thumbnail: (updateProductDto.thumbnailUrls ?? [])[i] || imgUrl,
          });
        },
      );
      product.images = images;
    }

    Object.assign(product, updateProductDto);
    return this.productsRepository.save(product);
  }

  // Remove Product
  async remove(uid: number) {
    const product = await this.findOne(uid);
    if (!product) throw new NotFoundException('Product not found');

    const category = product.category;
    if (category) {
      category.totalProducts = Math.max(0, category.totalProducts - 1);
      await this.categoriesRepository.save(category);
    }

    return this.productsRepository.remove(product);
  }

  // Get Product by ean
  async findByEan(ean: string) {
    const product = await this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.subCategory', 'subCategory')
      .leftJoinAndSelect('product.subSubCategory', 'subSubCategory')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.flags', 'flags')
      .leftJoinAndSelect('product.composition', 'composition')
      .where('product.ean = :ean', { ean })
      .getOne();

    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  // Get All Products
  async findAll(page = 1, limit = 10) {
    const take = Math.min(Math.max(limit, 1), 50);
    const skip = (page - 1) * take;

    const items = await this.productsRepository
      .createQueryBuilder('product')
      .leftJoin('product.images', 'images')
      .leftJoin('product.brand', 'brand')
      .select([
        'product.uid',
        'product.name',
        'product.validScore',
        'product.ean',
        'brand.id',
        'brand.name',
        'images.id',
        'images.thumbnail',
      ])
      .orderBy('product.uid', 'DESC')
      .skip(skip)
      .take(take + 1)
      .getMany();

    const hasMore = items.length > take;

    return {
      data: hasMore ? items.slice(0, take) : items,
      page,
      limit: take,
      hasMore,
    };
  }

  // Ge Product by Uid
  async findOne(uid: number) {
    const product = await this.productsRepository.findOne({
      where: { uid },
      relations: [
        'brand',
        'category',
        'subCategory',
        'subSubCategory',
        'images',
        'composition',
        'flags',
      ],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  // Ge Product by Category
  async findByCategory(categoryId: number, page = 1, limit = 10) {
    const [category, data] = await Promise.all([
      this.categoriesRepository.findOne({ where: { id: categoryId } }),

      this.productsRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.images', 'images')
        .leftJoinAndSelect('product.brand', 'brand')
        .where('product.categoryId = :categoryId', { categoryId })
        .orderBy('product.uid', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getMany(),
    ]);
    return {
      data,
      total: category?.totalProducts ?? 0,

      page,
      pageCount: category ? Math.ceil(category.totalProducts / limit) : 0,
    };
  }

  findBySubSubCategory(subSubCategoryId: number) {
    return this.productsRepository.find({
      where: { subSubCategory: { id: subSubCategoryId } },
    });
  }

  findBySubCategory(subCategoryId: number) {
    return this.productsRepository.find({
      where: { subCategory: { id: subCategoryId } },
    });
  }

  // Ge Product by Flage
  async findByFlag(flagId: number, page = 1, limit = 10) {
    const take = Math.min(Math.max(limit, 1), 50);
    const skip = (page - 1) * take;

    const flagExists = await this.flagsRepository.exist({
      where: { id: flagId },
    });
    if (!flagExists) throw new NotFoundException('Flag not found');

    const rows = await this.productsRepository
      .createQueryBuilder('product')
      .innerJoin('product.flags', 'flag', 'flag.id = :flagId', { flagId })
      .select('product.uid', 'uid')
      .orderBy('product.uid', 'DESC')
      .offset(skip)
      .limit(take)
      .getRawMany();

    const uids = rows.map((r) => r.uid);

    const data = uids.length
      ? await this.productsRepository.find({
          where: { uid: In(uids) },
          order: { uid: 'DESC' },
          relations: {
            images: true,
            brand: true,
          },
        })
      : [];

    return {
      data,
      page,
      limit: take,
      hasMore: data.length === take, // optional
    };
  }

  // Ge Product by ??
  async findByCategoryWithFlag(
    categoryId: number,
    flagId: number = 1,
    page: number = 1,
    limit: number = 10,
  ) {
    const data = await this.productsRepository
      .createQueryBuilder('product')
      .leftJoin('product.flags', 'flag')
      .leftJoin('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .where('category.id = :categoryId', { categoryId })
      .andWhere('flag.id = :flagId', { flagId })
      .orderBy('product.uid', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      page,
    };
  }

  // Find by Brand
  async findByBrand(brandId: number, page = 1, limit = 10) {
    const total = await this.productsRepository.count({
      where: { brand: { id: brandId } },
    });
    const products = await this.productsRepository
      .createQueryBuilder('product')
      .leftJoin('product.images', 'images')
      .select([
        'product.uid',
        'product.name',
        'product.validScore',
        'product.ean',
        'images.id',
        'images.thumbnail',
      ])
      .where('product.brandId = :brandId', { brandId })
      .orderBy('product.uid', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const data = products.map((product) => ({
      uid: product.uid,
      name: product.name,
      validScore: product.validScore,
      ean: product.ean,
      images:
        product.images?.map((img) => ({
          id: img.id,
          thumbnail: img.thumbnail,
        })) || [],
    }));

    return {
      data,
      total,
      page,
      pageCount: Math.ceil(total / limit),
    };
  }

  // Advanced Search
  async search(dto: SearchProductsDto) {
    const take = Math.min(Math.max(dto.limit ?? 10, 1), 50);
    const page = Math.max(dto.page ?? 1, 1);
    const skip = (page - 1) * take;

    const qb = this.productsRepository
      .createQueryBuilder('product')
      .leftJoin('product.images', 'images')
      .leftJoin('product.brand', 'brand')
      .leftJoin('product.category', 'category')
      .leftJoin('product.subCategory', 'subCategory')
      .leftJoin('product.subSubCategory', 'subSubCategory');

    qb.select([
      'product.uid',
      'product.name',
      'product.validScore',
      'product.ean',
      'product.type',
      'brand.id',
      'brand.name',
      'images.id',
      'images.thumbnail',
      'category.id',
      'category.name',
      'subCategory.id',
      'subCategory.name',
      'subSubCategory.id',
      'subSubCategory.name',
    ]);

    // -----------------------------
    // Base filters (ids)
    // -----------------------------
    if (dto.brandIds?.length) {
      qb.andWhere('brand.id IN (:...brandIds)', { brandIds: dto.brandIds });
    }
    if (dto.categoryIds?.length) {
      qb.andWhere('category.id IN (:...categoryIds)', {
        categoryIds: dto.categoryIds,
      });
    }
    if (dto.subCategoryIds?.length) {
      qb.andWhere('subCategory.id IN (:...subCategoryIds)', {
        subCategoryIds: dto.subCategoryIds,
      });
    }
    if (dto.subSubCategoryIds?.length) {
      qb.andWhere('subSubCategory.id IN (:...subSubCategoryIds)', {
        subSubCategoryIds: dto.subSubCategoryIds,
      });
    }

    // -----------------------------
    // Score range
    // -----------------------------
    if (dto.minScore !== undefined) {
      qb.andWhere('product.validScore >= :minScore', {
        minScore: dto.minScore,
      });
    }
    if (dto.maxScore !== undefined) {
      qb.andWhere('product.validScore <= :maxScore', {
        maxScore: dto.maxScore,
      });
    }

    // -----------------------------
    // Flags include (ANY / ALL)
    // Uses product_flags join table directly
    // -----------------------------
    if (dto.flagIds?.length) {
      if (dto.requireAllFlags) {
        qb.andWhere(
          `product.uid IN (
          SELECT pf."productUid"
          FROM product_flags pf
          WHERE pf."flagId" IN (:...flagIds)
          GROUP BY pf."productUid"
          HAVING COUNT(DISTINCT pf."flagId") = :flagCount
        )`,
          { flagIds: dto.flagIds, flagCount: dto.flagIds.length },
        );
      } else {
        qb.andWhere(
          `EXISTS (
          SELECT 1
          FROM product_flags pf
          WHERE pf."productUid" = product.uid
            AND pf."flagId" IN (:...flagIds)
        )`,
          { flagIds: dto.flagIds },
        );
      }
    }

    // -----------------------------
    // Ingredients include (ANY / ALL)
    // Uses product_ingredients join table directly
    // -----------------------------
    if (dto.includeIngredientIds?.length) {
      if (dto.requireAllIngredients) {
        qb.andWhere(
          `product.uid IN (
          SELECT pi."productUid"
          FROM product_ingredients pi
          WHERE pi."ingredientId" IN (:...includeIngredientIds)
          GROUP BY pi."productUid"
          HAVING COUNT(DISTINCT pi."ingredientId") = :ingCount
        )`,
          {
            includeIngredientIds: dto.includeIngredientIds,
            ingCount: dto.includeIngredientIds.length,
          },
        );
      } else {
        qb.andWhere(
          `EXISTS (
          SELECT 1
          FROM product_ingredients pi
          WHERE pi."productUid" = product.uid
            AND pi."ingredientId" IN (:...includeIngredientIds)
        )`,
          { includeIngredientIds: dto.includeIngredientIds },
        );
      }
    }

    // -----------------------------
    // Ingredients exclude (ANY match excluded)
    // -----------------------------
    if (dto.excludeIngredientIds?.length) {
      qb.andWhere(
        `NOT EXISTS (
        SELECT 1
        FROM product_ingredients pi
        WHERE pi."productUid" = product.uid
          AND pi."ingredientId" IN (:...excludeIngredientIds)
      )`,
        { excludeIngredientIds: dto.excludeIngredientIds },
      );
    }

    // -----------------------------
    // Ordering + pagination
    // -----------------------------
    qb.orderBy('product.validScore', 'DESC')
      .addOrderBy('product.uid', 'DESC')
      .skip(skip)
      .take(take);

    // Count total (distinct products) using a clone
    const countQb = qb
      .clone()
      .skip(undefined)
      .take(undefined)
      .orderBy()
      .select('COUNT(DISTINCT product.uid)', 'cnt');

    const [{ cnt }] = await countQb.getRawMany();
    const total = parseInt(cnt, 10) || 0;

    const data = await qb.getMany();

    return {
      data,
      page,
      limit: take,
      total,
      pageCount: Math.ceil(total / take),
      hasMore: page * take < total,
    };
  }
}
