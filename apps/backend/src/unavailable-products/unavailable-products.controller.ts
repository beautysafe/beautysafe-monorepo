import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiPayloadTooLargeResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { MAX_IMAGE_SIZE } from '../storage/file-validation';
import { FirebaseStorageService } from '../storage/firebase-storage.service';
import { UploadFolder } from '../storage/upload-folder.enum';
import { UserRole } from '../users/entities/user.entity';
import { CreateUnavailableProductDto } from './dto/create-unavailable-product.dto';
import { UnavailableProductsPageDto } from './dto/unavailable-products-page.dto';
import { UnavailableProductsQueryDto } from './dto/unavailable-products-query.dto';
import { UpdateUnavailableProductDto } from './dto/update-unavailable-product.dto';
import { UnavailableProduct } from './entities/unavailable-product.entity';
import { UnavailableProductsService } from './unavailable-products.service';

@ApiTags('Unavailable Products')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
@Controller('unavailable-products')
export class UnavailableProductsController {
  constructor(
    private readonly unavailableProductsService: UnavailableProductsService,
    private readonly storage: FirebaseStorageService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Submit a product that is missing from BeautySafe',
    description:
      'At least one image URL is required. EAN, product name, brand, and notes are optional.',
  })
  @ApiCreatedResponse({ type: UnavailableProduct })
  @ApiBadRequestResponse({
    description:
      'No image, invalid URL, duplicate URL, or another validation error',
  })
  create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateUnavailableProductDto,
  ) {
    return this.unavailableProductsService.create(request.user.userId, dto);
  }

  @Post('images')
  @ApiOperation({
    summary: 'Upload one missing-product photo before creating a submission',
    description:
      'Upload each photo, then send the returned url and storagePath in imageUrls and imageKeys.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', format: 'uri' },
        storagePath: { type: 'string' },
        filename: { type: 'string' },
        contentType: { type: 'string' },
        size: { type: 'number' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Missing or unsupported image' })
  @ApiPayloadTooLargeResponse({ description: 'Image exceeds 10 MB' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_IMAGE_SIZE },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.storage.uploadImage(file, UploadFolder.UNAVAILABLE_PRODUCTS);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List unavailable-product submissions (admin)' })
  @ApiOkResponse({ type: UnavailableProductsPageDto })
  @ApiForbiddenResponse({ description: 'Administrator role required' })
  findAll(@Query() query: UnavailableProductsQueryDto) {
    return this.unavailableProductsService.findAll(query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get an unavailable-product submission (admin)' })
  @ApiOkResponse({ type: UnavailableProduct })
  @ApiNotFoundResponse({ description: 'Submission not found' })
  @ApiForbiddenResponse({ description: 'Administrator role required' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.unavailableProductsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update status or link a resolved product (admin)',
  })
  @ApiOkResponse({ type: UnavailableProduct })
  @ApiNotFoundResponse({
    description: 'Submission or linked product not found',
  })
  @ApiForbiddenResponse({ description: 'Administrator role required' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUnavailableProductDto,
  ) {
    return this.unavailableProductsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete an invalid submission (admin)' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: { deleted: { type: 'boolean', example: true } },
    },
  })
  @ApiNotFoundResponse({ description: 'Submission not found' })
  @ApiForbiddenResponse({ description: 'Administrator role required' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.unavailableProductsService.remove(id);
  }
}
