import 'dotenv/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { validateEnvironment } from './config/environment';
import { DatabaseModule } from './database/database.module';
import { StorageModule } from './storage/storage.module';
import { AuthModule } from './auth/auth.module';
import { LandlordsModule } from './landlords/landlords.module';
import { PropertiesModule } from './properties/properties.module';
import { TenantsModule } from './tenants/tenants.module';
import { LeasesModule } from './leases/leases.module';
import { FinancesModule } from './finances/finances.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { DocumentsModule } from './documents/documents.module';
import { CommunicationsModule } from './communications/communications.module';
import { EmployeesModule } from './employees/employees.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { SearchModule } from './search/search.module';
import { NotificationsModule } from './notifications/notifications.module';
import { InspectionsModule } from './inspections/inspections.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { JobsModule } from './jobs/jobs.module';
import { LandlordPortalModule } from './landlord-portal/landlord-portal.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    DatabaseModule,
    StorageModule,
    AuthModule,
    LandlordsModule,
    PropertiesModule,
    TenantsModule,
    LeasesModule,
    FinancesModule,
    MaintenanceModule,
    DocumentsModule,
    CommunicationsModule,
    EmployeesModule,
    DashboardModule,
    ReportsModule,
    SearchModule,
    NotificationsModule,
    InspectionsModule,
    ComplaintsModule,
    ...(process.env.JOBS_ENABLED === 'true' ? [JobsModule] : []),
    LandlordPortalModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
