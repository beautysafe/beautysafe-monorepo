import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { UserRole } from '../users/entities/user.entity';
import { CreateProductFeedbackDto } from './dto/create-product-feedback.dto';
import {
  ProductFeedbackPageDto,
  ProductRatingSummaryDto,
} from './dto/product-feedback-page.dto';
import {
  AdminProductFeedbackQueryDto,
  ProductFeedbackQueryDto,
} from './dto/product-feedback-query.dto';
import { ProductFeedback } from './entities/product-feedback.entity';
import { ProductFeedbackService } from './product-feedback.service';

@ApiTags('Product Feedback')
@ApiBearerAuth()
@Controller('products/:productId/feedback')
export class ProductFeedbackController {
  constructor(
    private readonly productFeedbackService: ProductFeedbackService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create or update the current user’s feedback for a product',
    description:
      'There is one feedback row per user/product. Repeated submissions update it.',
  })
  @ApiCreatedResponse({ type: ProductFeedback })
  @ApiBadRequestResponse({
    description: 'Every rating must be an integer from 1 to 5',
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  upsert(
    @Req() request: AuthenticatedRequest,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: CreateProductFeedbackDto,
  ) {
    return this.productFeedbackService.upsert(
      request.user.userId,
      productId,
      dto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List paginated feedback for a product' })
  @ApiOkResponse({ type: ProductFeedbackPageDto })
  @ApiNotFoundResponse({ description: 'Product not found' })
  findForProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @Query() query: ProductFeedbackQueryDto,
  ) {
    return this.productFeedbackService.findForProduct(productId, query);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get aggregate ratings for a product' })
  @ApiOkResponse({ type: ProductRatingSummaryDto })
  @ApiNotFoundResponse({ description: 'Product not found' })
  getSummary(@Param('productId', ParseIntPipe) productId: number) {
    return this.productFeedbackService.getSummary(productId);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get the current user’s feedback for a product' })
  @ApiOkResponse({ type: ProductFeedback })
  @ApiNotFoundResponse({ description: 'Product or feedback not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  findMine(
    @Req() request: AuthenticatedRequest,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.productFeedbackService.findMine(request.user.userId, productId);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete the current user’s feedback for a product' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: { deleted: { type: 'boolean', example: true } },
    },
  })
  @ApiNotFoundResponse({ description: 'Feedback not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  removeMine(
    @Req() request: AuthenticatedRequest,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.productFeedbackService.removeMine(
      request.user.userId,
      productId,
    );
  }
}

@ApiTags('Product Feedback')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
@ApiForbiddenResponse({ description: 'Administrator role required' })
@Roles(UserRole.ADMIN)
@Controller('product-feedback')
export class AdminProductFeedbackController {
  constructor(
    private readonly productFeedbackService: ProductFeedbackService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List and search all feedback (admin)' })
  @ApiOkResponse({ type: ProductFeedbackPageDto })
  findAll(@Query() query: AdminProductFeedbackQueryDto) {
    return this.productFeedbackService.findAllForAdmin(query);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete inappropriate feedback (admin)' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: { deleted: { type: 'boolean', example: true } },
    },
  })
  @ApiNotFoundResponse({ description: 'Feedback not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productFeedbackService.removeForAdmin(id);
  }
}
