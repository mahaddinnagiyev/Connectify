import { Module } from '@nestjs/common';
import { MessengerService } from './messenger.service';
import { MessengerController } from './messenger.controller';
import { ChatGateway } from './gateway/messenger-gateway';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { JwtStrategy } from 'src/jwt/jwt-strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    SupabaseModule,
    JwtModule.register({}),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [MessengerService, ChatGateway, JwtStrategy],
  controllers: [MessengerController],
})
export class MessengerModule {}
