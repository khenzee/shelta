import { Module } from '@nestjs/common';
import { PropertiesController } from './properties.controller';
import { UnitsController } from './units.controller';
import { PropertiesService } from './services/properties.service';

@Module({
  controllers: [PropertiesController, UnitsController],
  providers: [PropertiesService],
})
export class PropertiesModule {}
