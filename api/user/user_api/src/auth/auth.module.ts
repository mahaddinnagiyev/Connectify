import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Account } from 'src/entities/account.entity';
import { JwtStrategy } from 'src/jwt/jwt-strategy';
import { PassportModule } from '@nestjs/passport';
import { TokenBlackList } from 'src/entities/token-black-list.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Account, TokenBlackList]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
