import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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

  async create(createProductDto: CreateProductDto) {
    const {
      name, validScore, ean, type,
      brandId, categoryId, subCategoryId, subSubCategoryId,
      imageUrls = [], thumbnailUrls = [],
      compositionIds = [], flagIds = [],
    } = createProductDto;

    const brand = await this.brandsRepository.findOne({ where: { id: brandId } });
    if (!brand) throw new NotFoundException('Brand not found');

    let category: Category | null = null;
    let subCategory: SubCategory | null = null;
    let subSubCategory: SubSubCategory | null = null;

    if (categoryId) {
      category = await this.categoriesRepository.findOne({ where: { id: categoryId } });
      if (!category) throw new NotFoundException('Category not found');
    }
    if (subCategoryId) {
      subCategory = await this.subCategoriesRepository.findOne({ where: { id: subCategoryId } });
      if (!subCategory) throw new NotFoundException('SubCategory not found');
    }
    if (subSubCategoryId) {
      subSubCategory = await this.subSubCategoriesRepository.findOne({ where: { id: subSubCategoryId } });
      if (!subSubCategory) throw new NotFoundException('SubSubCategory not found');
    }

    const composition = compositionIds.length > 0
      ? await this.ingredientsRepository.find({ where: { id: In(compositionIds) } })
      : [];

    const flags = flagIds.length > 0
      ? await this.flagsRepository.find({ where: { id: In(flagIds) } })
      : [];

    const images: ProductImage[] = (imageUrls.length > 0 ? imageUrls : []).map((imgUrl, i) => {
      return this.productImagesRepository.create({
        image: imgUrl,
        thumbnail: thumbnailUrls[i] || imgUrl,
      });
    });

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

    return this.productsRepository.save(product);
  }

  findAll() {
    return this.productsRepository.find();
  }

  async findOne(uid: number) {
    const product = await this.productsRepository.findOne({ where: { uid } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(uid: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(uid);

    if (updateProductDto.brandId) {
      const brand = await this.brandsRepository.findOne({ where: { id: updateProductDto.brandId } });
      if (!brand) throw new NotFoundException('Brand not found');
      product.brand = brand;
    }
    if (updateProductDto.categoryId !== undefined) {
      if (updateProductDto.categoryId === null) {
        product.category = null;
      } else {
        const category = await this.categoriesRepository.findOne({ where: { id: updateProductDto.categoryId } });
        if (!category) throw new NotFoundException('Category not found');
        product.category = category;
      }
    }
    if (updateProductDto.subCategoryId !== undefined) {
      if (updateProductDto.subCategoryId === null) {
        product.subCategory = null;
      } else {
        const subCategory = await this.subCategoriesRepository.findOne({ where: { id: updateProductDto.subCategoryId } });
        if (!subCategory) throw new NotFoundException('SubCategory not found');
        product.subCategory = subCategory;
      }
    }
    if (updateProductDto.subSubCategoryId !== undefined) {
      if (updateProductDto.subSubCategoryId === null) {
        product.subSubCategory = null;
      } else {
        const subSubCategory = await this.subSubCategoriesRepository.findOne({ where: { id: updateProductDto.subSubCategoryId } });
        if (!subSubCategory) throw new NotFoundException('SubSubCategory not found');
        product.subSubCategory = subSubCategory;
      }
    }

    if (updateProductDto.compositionIds) {
      product.composition = await this.ingredientsRepository.find({ where: { id: In(updateProductDto.compositionIds) } });
    }
    if (updateProductDto.flagIds) {
      product.flags = await this.flagsRepository.find({ where: { id: In(updateProductDto.flagIds) } });
    }
    if (updateProductDto.imageUrls || updateProductDto.thumbnailUrls) {
      await this.productImagesRepository.delete({ product: { uid } });
      const images: ProductImage[] = (updateProductDto.imageUrls ?? []).map((imgUrl, i) => {
        return this.productImagesRepository.create({
          image: imgUrl,
          thumbnail: (updateProductDto.thumbnailUrls ?? [])[i] || imgUrl,
        });
      });
      product.images = images;
    }

    Object.assign(product, updateProductDto);
    return this.productsRepository.save(product);
  }

  async remove(uid: number) {
    const product = await this.findOne(uid);
    if (!product) throw new NotFoundException('Product not found');
    return this.productsRepository.remove(product);
  }

  async findByEan(ean: string) {
    const product = await this.productsRepository.findOne({ where: { ean } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
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

  findByCategory(categoryId: number) {
    return this.productsRepository.find({
      where: { category: { id: categoryId } },
    });
  }

  findByFlag(flagId: number) {
    return this.productsRepository
      .createQueryBuilder('product')
      .leftJoin('product.flags', 'flag')
      .where('flag.id = :flagId', { flagId })
      .getMany();
  }
}
