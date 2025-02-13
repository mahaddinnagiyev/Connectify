import { Module } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { FriendshipController } from './friendship.controller';
import { JwtStrategy } from 'src/jwt/jwt-strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friendship } from 'src/entities/friendship.entity';
import { User } from 'src/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { LoggerModule } from 'src/logger/logger.module';
import { AuthModule } from 'src/auth/auth.module';
import { BlockList } from 'src/entities/blocklist.entity';
import { Account } from 'src/entities/account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Friendship, User, Account, BlockList]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    LoggerModule,
    AuthModule
  ],
  providers: [FriendshipService, JwtStrategy],
  controllers: [FriendshipController]
})
export class FriendshipModule {}
