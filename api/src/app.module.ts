import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { config } from './orm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from './logger/logger.module';
import { AccountModule } from './account/account.module';
import { SupabaseModule } from './supabase/supabase.module';
import { FriendshipModule } from './friendship/friendship.module';
import { MessengerModule } from './messenger/messenger.module';
import { WebpushModule } from './webpush/webpush.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(config),
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60 * 1000,
        limit: 10,
        blockDuration: 60 * 1000,
      },
    ]),
    UserModule,
    AuthModule,
    LoggerModule,
    AccountModule,
    SupabaseModule,
    FriendshipModule,
    MessengerModule,
    WebpushModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
