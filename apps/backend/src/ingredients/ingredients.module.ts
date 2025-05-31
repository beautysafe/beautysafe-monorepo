import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngredientsController } from './ingredients.controller';
import { IngredientsService } from './ingredients.service';
import { Ingredient } from './entities/ingredient.entity';
import { Family } from '../families/entities/family.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ingredient, Family])],
  controllers: [IngredientsController],
  providers: [IngredientsService],
})
export class IngredientsModule {}
