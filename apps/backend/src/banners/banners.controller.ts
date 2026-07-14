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
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { Banner } from './entities/banner.entity';

@ApiBearerAuth()
@ApiTags('banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @ApiOperation({ summary: 'Create a new banner' })
  @ApiCreatedResponse({ type: Banner })
  @Post()
  create(@Body() createBannerDto: CreateBannerDto) {
    return this.bannersService.create(createBannerDto);
  }

  @Public()
  @ApiOkResponse({ type: Banner, isArray: true })
  @Get()
  findAll() {
    return this.bannersService.findAll();
  }
  @Public()
  @ApiOkResponse({ type: Banner })
  @ApiNotFoundResponse({ description: 'Banner not found' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bannersService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a banner' })
  @ApiOkResponse({ type: Banner })
  @ApiNotFoundResponse({ description: 'Banner not found' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBannerDto: UpdateBannerDto,
  ) {
    return this.bannersService.update(id, updateBannerDto);
  }

  @ApiOkResponse({ type: Banner })
  @ApiNotFoundResponse({ description: 'Banner not found' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bannersService.remove(id);
  }
}
