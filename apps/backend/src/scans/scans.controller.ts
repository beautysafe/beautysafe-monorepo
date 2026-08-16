import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateProductScanDto } from './dto/create-product-scan.dto';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import {
  ProductScansPageDto,
  ProductScanStatsDto,
  RecordedProductScanDto,
} from './dto/product-scan-responses.dto';
import { ProductScansQueryDto } from './dto/product-scans-query.dto';
import { ScansService } from './scans.service';

@ApiTags('Scans')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
@Controller('scans')
export class ScansController {
  constructor(private readonly scansService: ScansService) {}

  @Post()
  @ApiOperation({
    summary: 'Record one genuine successful product scan',
    description:
      'Every call creates a new event. Product lookup endpoints never record scans automatically.',
  })
  @ApiCreatedResponse({ type: RecordedProductScanDto })
  @ApiBadRequestResponse({
    description: 'productId must be a positive integer',
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  record(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateProductScanDto,
  ) {
    return this.scansService.record(request.user.userId, dto);
  }
}

@ApiTags('Scans')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
@Controller('users/me/scans')
export class UserScansController {
  constructor(private readonly scansService: ScansService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get only the current user’s scan totals' })
  @ApiOkResponse({ type: ProductScanStatsDto })
  getStats(@Req() request: AuthenticatedRequest) {
    return this.scansService.getMyStats(request.user.userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get only the current user’s scan history, newest first',
  })
  @ApiOkResponse({ type: ProductScansPageDto })
  findMine(
    @Req() request: AuthenticatedRequest,
    @Query() query: ProductScansQueryDto,
  ) {
    return this.scansService.findMine(request.user.userId, query);
  }
}
