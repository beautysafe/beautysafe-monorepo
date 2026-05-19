import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './entities/banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { Product } from '../products/entities/product.entity';
@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private bannerRepository: Repository<Banner>,
  ) {}

  async create(createBannerDto: CreateBannerDto) {
    const { productIds, ...bannerData } = createBannerDto;

    const banner = this.bannerRepository.create(bannerData);

    if (productIds?.length) {
      banner.products = productIds.map((uid) => ({ uid }) as Product);
    }

    return this.bannerRepository.save(banner);
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
    const banner = await this.bannerRepository.findOne({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');
    Object.assign(banner, updateBannerDto);
    return this.bannerRepository.save(banner);
  }

  async remove(id: number) {
    const banner = await this.findOne(id);
    if (!banner) throw new NotFoundException('Banner not found');
    return this.bannerRepository.remove(banner);
  }
}
