import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubsubcategoriesController } from './subsubcategories.controller';
import { SubsubcategoriesService } from './subsubcategories.service';
import { SubSubCategory } from './entities/subsubcategory.entity';
import { SubCategory } from '../subcategories/entities/subcategory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubSubCategory, SubCategory])],
  controllers: [SubsubcategoriesController],
  providers: [SubsubcategoriesService],
})
export class SubsubcategoriesModule {}
