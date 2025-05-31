import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlagsController } from './flags.controller';
import { FlagsService } from './flags.service';
import { Flag } from './entities/flag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Flag])],
  controllers: [FlagsController],
  providers: [FlagsService],
})
export class FlagsModule {}
