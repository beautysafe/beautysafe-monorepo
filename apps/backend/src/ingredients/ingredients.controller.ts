import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiOkResponse,
  ApiExtraModels,
} from '@nestjs/swagger';
import { Ingredient, IngredientStatus } from './entities/ingredient.entity';
import { ResolveIngredientsDto } from './dto/resolve-ingredients.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { IngredientSearchQueryDto } from './dto/ingredient-search-query.dto';
import { IngredientSearchResponseDto } from './dto/ingredient-search-response.dto';
import {
  AmbiguousIngredientMatchDto,
  ResolveIngredientsResponseDto,
} from './dto/resolve-ingredients-response.dto';

@ApiBearerAuth()
@ApiTags('ingredients')
@ApiExtraModels(
  Ingredient,
  IngredientSearchResponseDto,
  AmbiguousIngredientMatchDto,
  ResolveIngredientsResponseDto,
)
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}
  @ApiOperation({ summary: 'Create a new ingredient' })
  @Post()
  create(@Body() createIngredientDto: CreateIngredientDto) {
    return this.ingredientsService.create(createIngredientDto);
  }
  @ApiOperation({
    summary: 'Search ingredients by name or official name',
    description:
      'q performs a unified OR search across both fields with exact matches first. name and officialName remain available for backward compatibility. Supplying page or limit returns the paginated response; otherwise the legacy Ingredient[] response is returned.',
  })
  @ApiOkResponse({
    schema: {
      oneOf: [
        { type: 'array', items: { $ref: '#/components/schemas/Ingredient' } },
        { $ref: '#/components/schemas/IngredientSearchResponseDto' },
      ],
    },
  })
  @Get('search')
  async searchIngredients(@Query() query: IngredientSearchQueryDto) {
    const result = await this.ingredientsService.search(query);
    return query.page !== undefined || query.limit !== undefined
      ? result
      : result.items;
  }

  @ApiOperation({
    summary: 'Resolve a pasted ingredient list',
    description:
      'Matches names case-insensitively and creates missing ingredients with status NEW, score 0, bs_score 0, and officialName equal to the submitted name.',
  })
  @ApiQuery({
    name: 'summary',
    required: false,
    type: Boolean,
    description:
      'Return existing/new resolution counts. Omit for the legacy Ingredient[] response.',
  })
  @ApiOkResponse({
    schema: {
      oneOf: [
        { type: 'array', items: { $ref: '#/components/schemas/Ingredient' } },
        { $ref: '#/components/schemas/ResolveIngredientsResponseDto' },
      ],
    },
  })
  @Roles('admin')
  @Post('resolve')
  async resolve(
    @Body() dto: ResolveIngredientsDto,
    @Query('summary') summary?: string,
  ) {
    const result = await this.ingredientsService.resolveNames(dto.names);
    return summary === 'true' ? result : result.ingredients;
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: IngredientStatus })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status: IngredientStatus = IngredientStatus.ACTIVE,
  ) {
    return this.ingredientsService.findAll(+page, +limit, status);
  }

  @Get('new')
  @Roles('admin')
  @ApiOperation({ summary: 'List ingredients awaiting admin review' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findNew(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.ingredientsService.findAll(+page, +limit, IngredientStatus.NEW);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ingredientsService.findOne(id);
  }
  @ApiOperation({ summary: 'Update a new ingredient' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateIngredientDto: UpdateIngredientDto,
  ) {
    return this.ingredientsService.update(id, updateIngredientDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ingredientsService.remove(id);
  }
}
