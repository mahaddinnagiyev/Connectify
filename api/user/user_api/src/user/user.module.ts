import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Account } from 'src/entities/account.entity';
import { PassportModule } from '@nestjs/passport';
import { LoggerModule } from 'src/logger/logger.module';
import { JwtStrategy } from 'src/jwt/jwt-strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Account]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    LoggerModule,
  ],
  providers: [UserService, JwtStrategy],
  controllers: [UserController],
})
export class UserModule {}
