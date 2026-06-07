import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from '../groups/entities/group.entity';
import { Journey } from '../journeys/entities/journey.entity';
import { ProductList } from '../product-lists/entities/product-list.entity';
import { SubGroup } from './entities/subgroup.entity';
import { SubgroupsController } from './subgroups.controller';
import { SubgroupsService } from './subgroups.service';

@Module({
  imports: [TypeOrmModule.forFeature([SubGroup, Group, ProductList, Journey])],
  controllers: [SubgroupsController],
  providers: [SubgroupsService],
  exports: [SubgroupsService],
})
export class SubgroupsModule {}
