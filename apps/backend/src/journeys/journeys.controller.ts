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
import { CreateJourneyPhaseDto } from './dto/create-journey-phase.dto';
import { CreateJourneyDto } from './dto/create-journey.dto';
import { JourneyIngredientsDto } from './dto/journey-ingredients.dto';
import { JourneyPhaseProductsDto } from './dto/journey-phase-products.dto';
import { UpdateJourneyPhaseDto } from './dto/update-journey-phase.dto';
import { UpdateJourneyDto } from './dto/update-journey.dto';
import { JourneysService } from './journeys.service';

@ApiBearerAuth()
@ApiTags('journeys')
@Controller()
export class JourneysController {
  constructor(private readonly journeysService: JourneysService) {}

  @Roles('admin')
  @ApiOperation({ summary: 'Create a new journey' })
  @Post('subgroups/:subgroupId/journeys')
  create(
    @Param('subgroupId', ParseIntPipe) subgroupId: number,
    @Body() createJourneyDto: CreateJourneyDto,
  ) {
    return this.journeysService.create(subgroupId, createJourneyDto);
  }

  @Public()
  @Get('journeys/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.journeysService.findOne(id);
  }

  @Roles('admin')
  @ApiOperation({ summary: 'Update a journey' })
  @Patch('journeys/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateJourneyDto: UpdateJourneyDto,
  ) {
    return this.journeysService.update(id, updateJourneyDto);
  }

  @Roles('admin')
  @Delete('journeys/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.journeysService.remove(id);
  }

  @Roles('admin')
  @ApiOperation({ summary: 'Create a new journey phase' })
  @Post('journeys/:journeyId/phases')
  createPhase(
    @Param('journeyId', ParseIntPipe) journeyId: number,
    @Body() createJourneyPhaseDto: CreateJourneyPhaseDto,
  ) {
    return this.journeysService.createPhase(journeyId, createJourneyPhaseDto);
  }

  @Roles('admin')
  @ApiOperation({ summary: 'Update a journey phase' })
  @Patch('journey-phases/:id')
  updatePhase(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateJourneyPhaseDto: UpdateJourneyPhaseDto,
  ) {
    return this.journeysService.updatePhase(id, updateJourneyPhaseDto);
  }

  @Roles('admin')
  @Delete('journey-phases/:id')
  removePhase(@Param('id', ParseIntPipe) id: number) {
    return this.journeysService.removePhase(id);
  }

  @Roles('admin')
  @Post('journey-phases/:id/products')
  addPhaseProducts(
    @Param('id', ParseIntPipe) id: number,
    @Body() journeyPhaseProductsDto: JourneyPhaseProductsDto,
  ) {
    return this.journeysService.addPhaseProducts(id, journeyPhaseProductsDto);
  }

  @Roles('admin')
  @Delete('journey-phases/:id/products/:productId')
  removePhaseProduct(
    @Param('id', ParseIntPipe) id: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.journeysService.removePhaseProduct(id, productId);
  }

  @Roles('admin')
  @Post('journeys/:journeyId/ingredients')
  addIngredients(
    @Param('journeyId', ParseIntPipe) journeyId: number,
    @Body() journeyIngredientsDto: JourneyIngredientsDto,
  ) {
    return this.journeysService.addIngredients(journeyId, journeyIngredientsDto);
  }

  @Roles('admin')
  @Delete('journeys/:journeyId/ingredients/:ingredientId')
  removeIngredient(
    @Param('journeyId', ParseIntPipe) journeyId: number,
    @Param('ingredientId', ParseIntPipe) ingredientId: number,
  ) {
    return this.journeysService.removeIngredient(journeyId, ingredientId);
  }
}
