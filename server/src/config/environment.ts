import { plainToInstance, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsEmail,
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

  @IsString()
  @IsNotEmpty()
  STORAGE_LOCAL_ROOT = './storage';

  @IsString()
  @IsNotEmpty()
  SUPERADMIN_NAME = 'Super Admin';

  @IsEmail()
  SUPERADMIN_EMAIL = 'admin@shelta.local';

  @IsString()
  @IsOptional()
  SUPERADMIN_PASSWORD?: string;

  @IsString()
  @IsNotEmpty()
  ORGANIZATION_NAME = 'Shelta Organization';

  @IsString()
  @IsNotEmpty()
  ORGANIZATION_LEGAL_NAME = 'Shelta Real Estate Management';

  @IsString()
  @IsNotEmpty()
  ORGANIZATION_PHONE = '+234801234567';

  @IsString()
  @IsNotEmpty()
  ORGANIZATION_ADDRESS = '123 Victoria Island, Lagos';

  @IsString()
  @IsNotEmpty()
  SMTP_HOST = 'localhost';

  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(65535)
  SMTP_PORT = 1025;

  @IsIn(['true', 'false'])
  SMTP_SECURE = 'false';

  @IsString()
  @IsOptional()
  SMTP_USER?: string;

  @IsString()
  @IsOptional()
  SMTP_PASSWORD?: string;

  @IsEmail()
  SMTP_FROM_EMAIL = 'no-reply@shelta.local';

  @IsString()
  @IsNotEmpty()
  SMTP_FROM_NAME = 'Shelta';

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

  @IsIn(['true', 'false'])
  AI_ENABLED = 'false';

  @IsIn(['OPENAI_COMPATIBLE', 'OPENAI', 'ANTHROPIC', 'GOOGLE'])
  AI_DEFAULT_PROVIDER_TYPE = 'OPENAI_COMPATIBLE';

  @IsString()
  AI_DEFAULT_PROVIDER_NAME = 'deployment-gateway';

  @IsUrl({ require_tld: false })
  @IsOptional()
  AI_DEFAULT_BASE_URL?: string;

  @IsString()
  @IsOptional()
  AI_DEFAULT_API_KEY?: string;

  @IsString()
  @IsOptional()
  AI_DEFAULT_MODEL_ID?: string;

  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(10)
  AI_MAX_TOOL_STEPS = 5;

  @IsInt()
  @Type(() => Number)
  @Min(100)
  @Max(8000)
  AI_MAX_OUTPUT_TOKENS = 400;
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

  if (Boolean(validated.SMTP_USER) !== Boolean(validated.SMTP_PASSWORD)) {
    throw new Error('SMTP_USER and SMTP_PASSWORD must be configured together');
  }

  const aiValues = [
    validated.AI_DEFAULT_BASE_URL,
    validated.AI_DEFAULT_API_KEY,
    validated.AI_DEFAULT_MODEL_ID,
  ];
  if (aiValues.some(Boolean) && !aiValues.every(Boolean)) {
    throw new Error(
      'AI_DEFAULT_BASE_URL, AI_DEFAULT_API_KEY and AI_DEFAULT_MODEL_ID must be configured together',
    );
  }

  if (
    validated.NODE_ENV === 'production' &&
    (!validated.SUPERADMIN_PASSWORD ||
      validated.SUPERADMIN_PASSWORD.length < 12)
  ) {
    throw new Error(
      'SUPERADMIN_PASSWORD must contain at least 12 characters in production',
    );
  }

  return validated;
}
