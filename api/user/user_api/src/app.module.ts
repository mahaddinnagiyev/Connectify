import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { config } from './orm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    TypeOrmModule.forRoot(config),
    UserModule,
    AuthModule,
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      }
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
