import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { EnvironmentVariables } from '../config/environment';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(config: ConfigService<EnvironmentVariables, true>) {
    const adapter = new PrismaPg({
      connectionString: config.get('DATABASE_URL', { infer: true }),
      max: config.get('DATABASE_POOL_MAX', { infer: true }),
      connectionTimeoutMillis: config.get('DATABASE_CONNECTION_TIMEOUT_MS', {
        infer: true,
      }),
      idleTimeoutMillis: config.get('DATABASE_IDLE_TIMEOUT_MS', {
        infer: true,
      }),
      application_name: 'shelta-api',
    });
    super({ adapter });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
