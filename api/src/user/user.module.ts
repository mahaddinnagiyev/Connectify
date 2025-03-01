import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Account } from 'src/entities/account.entity';
import { PassportModule } from '@nestjs/passport';
import { LoggerModule } from 'src/logger/logger.module';
import { JwtStrategy } from 'src/jwt/jwt-strategy';
import { AuthModule } from 'src/auth/auth.module';
import { BlockList } from 'src/entities/blocklist.entity';
import { Friendship } from 'src/entities/friendship.entity';
import { PrivacySettings } from 'src/entities/privacy-settings.entity';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Account, Friendship, PrivacySettings, BlockList]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    LoggerModule,
    AuthModule,
    SupabaseModule
  ],
  providers: [UserService, JwtStrategy],
  controllers: [UserController],
})
export class UserModule {}
