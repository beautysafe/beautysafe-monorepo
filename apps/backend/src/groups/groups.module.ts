import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Journey } from '../journeys/entities/journey.entity';
import { ProductList } from '../product-lists/entities/product-list.entity';
import { SubGroup } from '../subgroups/entities/subgroup.entity';
import { SubgroupsService } from '../subgroups/subgroups.service';
import { Group } from './entities/group.entity';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';

@Module({
  imports: [TypeOrmModule.forFeature([Group, SubGroup, ProductList, Journey])],
  controllers: [GroupsController],
  providers: [GroupsService, SubgroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
