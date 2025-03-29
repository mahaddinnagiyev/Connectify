import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import Redis from 'ioredis';
import * as dotenv from 'dotenv';
import * as session from 'express-session';
import { RedisStore } from 'connect-redis';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: `${process.env.CLIENT_URL || 'http://localhost:5173'}`,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const redis = new Redis({
    host: process.env.REDIS_URL,
    port: 6379,
    password: process.env.REDIS_PASSWORD,
    tls: {},
  });

  app.use(
    session({
      name: 'n_sid',
      store: new RedisStore({ client: redis }),
      secret: process.env.SESSION_SECRET_KEY,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'https-production',
        sameSite: 'none',
        maxAge: 30 * 60 * 1000,
      },
    }),
  );

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', true);

  await app.listen(process.env.PORT ?? 3636);
}
bootstrap();
