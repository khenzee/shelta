import { Module } from '@nestjs/common';
import { LandlordsController } from './landlords.controller';
import { LandlordsService } from './services/landlords.service';

@Module({
  controllers: [LandlordsController],
  providers: [LandlordsService],
})
export class LandlordsModule {}
