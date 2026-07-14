import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BannersController } from './banners.controller';
import { BannersService } from './banners.service';
import { Banner } from './entities/banner.entity';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Banner, Product])],
  controllers: [BannersController],
  providers: [BannersService],
})
export class BannersModule {}
