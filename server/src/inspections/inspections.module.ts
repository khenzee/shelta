import { Module } from '@nestjs/common';
import { InspectionsController } from './inspections.controller';
import { InspectionsService } from './services/inspections.service';

@Module({
  controllers: [InspectionsController],
  providers: [InspectionsService],
})
export class InspectionsModule {}
