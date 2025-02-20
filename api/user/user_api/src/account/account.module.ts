import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'src/entities/account.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/jwt/jwt-strategy';
import { LoggerModule } from 'src/logger/logger.module';
import { User } from 'src/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { PrivacySettings } from 'src/entities/privacy-settings.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Account, PrivacySettings]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    LoggerModule,
    AuthModule,
    SupabaseModule,
  ],
  providers: [AccountService, JwtStrategy],
  controllers: [AccountController],
})
export class AccountModule {}
