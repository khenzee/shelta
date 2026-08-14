import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { RolesGuard } from './guards/roles.guard';
import { LandlordGuard } from './guards/landlord.guard';
import { EnvironmentVariables } from '../config/environment';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: {
          algorithm: config.get('JWT_ALGORITHM'),
          expiresIn: config.get('JWT_ACCESS_TOKEN_EXPIRY'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    RolesGuard,
    LandlordGuard,
  ],
  exports: [AuthService, RolesGuard, LandlordGuard],
})
export class AuthModule {}
