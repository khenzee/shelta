import { Module } from '@nestjs/common';
import { LandlordPortalController } from './landlord-portal.controller';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [LandlordPortalController],
})
export class LandlordPortalModule {}
