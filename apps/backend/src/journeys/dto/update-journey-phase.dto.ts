import { PartialType } from '@nestjs/swagger';
import { CreateJourneyPhaseDto } from './create-journey-phase.dto';

export class UpdateJourneyPhaseDto extends PartialType(CreateJourneyPhaseDto) {}
