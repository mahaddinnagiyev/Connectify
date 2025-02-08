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
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Account, TokenBlackList]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    LoggerModule,
    HttpModule
  ],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  controllers: [AuthController],
  exports: [TypeOrmModule]
})
export class AuthModule {}
