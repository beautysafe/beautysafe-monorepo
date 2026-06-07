import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateSubGroupDto } from '../subgroups/dto/create-subgroup.dto';
import { SubgroupsService } from '../subgroups/subgroups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupsService } from './groups.service';

@ApiBearerAuth()
@ApiTags('groups')
@Controller('groups')
export class GroupsController {
  constructor(
    private readonly groupsService: GroupsService,
    private readonly subgroupsService: SubgroupsService,
  ) {}

  @Roles('admin')
  @ApiOperation({ summary: 'Create a new group' })
  @Post()
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupsService.create(createGroupDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.groupsService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.findOne(id);
  }

  @Public()
  @Get(':id/subgroups')
  findSubgroups(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.findSubgroups(id);
  }

  @Roles('admin')
  @Post(':groupId/subgroups')
  createSubgroup(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() createSubGroupDto: CreateSubGroupDto,
  ) {
    return this.subgroupsService.create(groupId, createSubGroupDto);
  }

  @Roles('admin')
  @ApiOperation({ summary: 'Update a group' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    return this.groupsService.update(id, updateGroupDto);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.remove(id);
  }
}
