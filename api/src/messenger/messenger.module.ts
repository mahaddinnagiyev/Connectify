import { Module } from '@nestjs/common';
import { MessengerService } from './messenger.service';
import { MessengerController } from './messenger.controller';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { JwtStrategy } from 'src/jwt/jwt-strategy';
import { PassportModule } from '@nestjs/passport';
import { LoggerModule } from 'src/logger/logger.module';
import { AuthModule } from 'src/auth/auth.module';
import { ChatGateway } from './gateway/messenger-gateway';
import { JwtModule } from '@nestjs/jwt';
import { WebpushModule } from 'src/webpush/webpush.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    SupabaseModule,
    AuthModule,
    LoggerModule,
    WebpushModule
  ],
  providers: [MessengerService, JwtStrategy, ChatGateway],
  controllers: [MessengerController],
})
export class MessengerModule {}
