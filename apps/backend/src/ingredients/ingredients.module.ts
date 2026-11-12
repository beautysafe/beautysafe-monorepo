import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngredientsController } from './ingredients.controller';
import { IngredientsService } from './ingredients.service';
import { Ingredient } from './entities/ingredient.entity';
import { Family } from '../families/entities/family.entity';
import { BeautySafeScoringModule } from '../beautysafe-scoring/beautysafe-scoring.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ingredient, Family]),
    BeautySafeScoringModule,
  ],
  controllers: [IngredientsController],
  providers: [IngredientsService],
})
export class IngredientsModule {}
