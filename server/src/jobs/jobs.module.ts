import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { EmailProcessor } from './processors/email.processor';
import { ReminderProcessor } from './processors/reminder.processor';
import { ReportProcessor } from './processors/report.processor';
import { EnvironmentVariables } from '../config/environment';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'email',
      useFactory: (config: ConfigService<EnvironmentVariables, true>) => ({
        redis: {
          host: config.get('REDIS_HOST', { infer: true }) || 'localhost',
          port: config.get('REDIS_PORT', { infer: true }) || 6379,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueueAsync({
      name: 'reminders',
      useFactory: (config: ConfigService<EnvironmentVariables, true>) => ({
        redis: {
          host: config.get('REDIS_HOST', { infer: true }) || 'localhost',
          port: config.get('REDIS_PORT', { infer: true }) || 6379,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueueAsync({
      name: 'reports',
      useFactory: (config: ConfigService<EnvironmentVariables, true>) => ({
        redis: {
          host: config.get('REDIS_HOST', { infer: true }) || 'localhost',
          port: config.get('REDIS_PORT', { infer: true }) || 6379,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [EmailProcessor, ReminderProcessor, ReportProcessor],
  exports: [BullModule],
})
export class JobsModule {}
