import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { BeautySafeScoringService } from './beautysafe-scoring.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [BeautySafeScoringService],
  exports: [BeautySafeScoringService],
})
export class BeautySafeScoringModule {}
