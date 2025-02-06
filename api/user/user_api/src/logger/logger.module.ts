import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { LoggerController } from './logger.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logger } from 'src/entities/logger.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Logger])],
  providers: [LoggerService],
  controllers: [LoggerController],
  exports: [LoggerService]
})
export class LoggerModule {}
