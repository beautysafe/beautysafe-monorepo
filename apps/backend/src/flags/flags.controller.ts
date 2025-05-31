import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { FlagsService } from './flags.service';
import { CreateFlagDto } from './dto/create-flag.dto';
import { UpdateFlagDto } from './dto/update-flag.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('flags')
@Controller('flags')
export class FlagsController {
  constructor(private readonly flagsService: FlagsService) {}
  @ApiOperation({ summary: 'Create a new flag' })
  @Post()
  create(@Body() createFlagDto: CreateFlagDto) {
    return this.flagsService.create(createFlagDto);
  }

  @Get()
  findAll() {
    return this.flagsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.flagsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateFlagDto: UpdateFlagDto) {
    return this.flagsService.update(id, updateFlagDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.flagsService.remove(id);
  }
}
