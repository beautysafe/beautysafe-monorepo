import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { Product } from '../products/entities/product.entity';
import { SubGroup } from '../subgroups/entities/subgroup.entity';
import { JourneyPhase } from './entities/journey-phase.entity';
import { Journey } from './entities/journey.entity';
import { JourneysController } from './journeys.controller';
import { JourneysService } from './journeys.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Journey,
      JourneyPhase,
      SubGroup,
      Product,
      Ingredient,
    ]),
  ],
  controllers: [JourneysController],
  providers: [JourneysService],
})
export class JourneysModule {}
