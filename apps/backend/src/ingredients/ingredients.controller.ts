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
} from '@nestjs/swagger';
import { Ingredient, IngredientStatus } from './entities/ingredient.entity';
import { ResolveIngredientsDto } from './dto/resolve-ingredients.dto';
import { Roles } from '../common/decorators/roles.decorator';

@ApiBearerAuth()
@ApiTags('ingredients')
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}
  @ApiOperation({ summary: 'Create a new ingredient' })
  @Post()
  create(@Body() createIngredientDto: CreateIngredientDto) {
    return this.ingredientsService.create(createIngredientDto);
  }
  @ApiOperation({ summary: 'Search ingredients by name' })
  @ApiQuery({ name: 'q', required: true, type: String, example: 'Aqua' })
  @ApiQuery({ name: 'status', required: false, enum: IngredientStatus })
  @Get('search')
  searchBrands(
    @Query('q') query: string,
    @Query('status') status?: IngredientStatus,
  ) {
    return this.ingredientsService.searchByName(query, status);
  }

  @ApiOperation({
    summary: 'Resolve a pasted ingredient list',
    description:
      'Matches names case-insensitively and creates missing ingredients with status NEW, score 0, and officialName equal to the submitted name.',
  })
  @ApiOkResponse({ type: [Ingredient] })
  @Roles('admin')
  @Post('resolve')
  resolve(@Body() dto: ResolveIngredientsDto) {
    return this.ingredientsService.resolveNames(dto.names);
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
