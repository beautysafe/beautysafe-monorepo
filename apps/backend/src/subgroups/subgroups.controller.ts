import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdateSubGroupDto } from './dto/update-subgroup.dto';
import { SubgroupsService } from './subgroups.service';

@ApiBearerAuth()
@ApiTags('subgroups')
@Controller('subgroups')
export class SubgroupsController {
  constructor(private readonly subgroupsService: SubgroupsService) {}

  @Public()
  @Get()
  findAll() {
    return this.subgroupsService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.subgroupsService.findOne(id);
  }

  @Public()
  @Get(':id/product-lists')
  findProductLists(@Param('id', ParseIntPipe) id: number) {
    return this.subgroupsService.findProductLists(id);
  }

  @Public()
  @Get(':id/journeys')
  findJourneys(@Param('id', ParseIntPipe) id: number) {
    return this.subgroupsService.findJourneys(id);
  }

  @Roles('admin')
  @ApiOperation({ summary: 'Update a subgroup' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubGroupDto: UpdateSubGroupDto,
  ) {
    return this.subgroupsService.update(id, updateSubGroupDto);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.subgroupsService.remove(id);
  }
}
