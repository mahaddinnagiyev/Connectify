import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Account } from 'src/entities/account.entity';
import { JwtStrategy } from 'src/jwt/jwt-strategy';
import { PassportModule } from '@nestjs/passport';
import { TokenBlackList } from 'src/entities/token-black-list.entity';
import { LoggerModule } from 'src/logger/logger.module';
import { GoogleStrategy } from './strategy/google.strategy';
import { JwtAuthGuard } from 'src/jwt/jwt-auth-guard';
import { JwtModule } from '@nestjs/jwt';
import { PrivacySettings } from 'src/entities/privacy-settings.entity';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Account, PrivacySettings, TokenBlackList]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET_KEY,
      signOptions: { expiresIn: '5d' },
    }),
    LoggerModule,
    SupabaseModule
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, GoogleStrategy],
  controllers: [AuthController],
  exports: [TypeOrmModule, JwtAuthGuard]
})
export class AuthModule {}
