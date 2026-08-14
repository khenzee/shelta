import { plainToInstance, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  validateSync,
} from 'class-validator';

export class EnvironmentVariables {
  @IsIn(['development', 'test', 'production'])
  NODE_ENV = 'development';

  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(65535)
  PORT = 4000;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @IsOptional()
  DIRECT_URL?: string;

  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(50)
  DATABASE_POOL_MAX = 10;

  @IsInt()
  @Type(() => Number)
  @Min(1000)
  DATABASE_CONNECTION_TIMEOUT_MS = 10000;

  @IsInt()
  @Type(() => Number)
  @Min(1000)
  DATABASE_IDLE_TIMEOUT_MS = 30000;

  @IsUrl({ require_tld: false })
  FRONTEND_URL = 'http://localhost:3001';

  @IsUrl({ require_tld: false })
  @IsOptional()
  SUPABASE_URL?: string;

  @IsString()
  @IsOptional()
  SUPABASE_SERVICE_ROLE_KEY?: string;

  @IsString()
  @IsOptional()
  SUPABASE_STORAGE_BUCKET = 'documents';

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsIn(['HS256', 'HS384', 'HS512'])
  JWT_ALGORITHM = 'HS256';

  @IsString()
  @IsOptional()
  JWT_ACCESS_TOKEN_EXPIRY = '15m';

  @IsString()
  @IsOptional()
  JWT_REFRESH_TOKEN_EXPIRY = '7d';

  @IsString()
  @IsOptional()
  REDIS_HOST = 'localhost';

  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(65535)
  @IsOptional()
  REDIS_PORT = 6379;

  @IsIn(['true', 'false'])
  JOBS_ENABLED = 'false';
}

export function validateEnvironment(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
    exposeDefaultValues: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  if (
    validated.NODE_ENV === 'production' &&
    validated.JWT_SECRET === 'super-secret-jwt-key-change-in-production'
  ) {
    throw new Error('JWT_SECRET must be replaced in production');
  }

  if (
    validated.NODE_ENV === 'production' &&
    Boolean(validated.SUPABASE_URL) !==
      Boolean(validated.SUPABASE_SERVICE_ROLE_KEY)
  ) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured together',
    );
  }

  return validated;
}
