import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { LoggerController } from './logger.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logger } from 'src/entities/logger.entity';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Module({
  imports: [TypeOrmModule.forFeature([Logger]), SupabaseModule],
  providers: [LoggerService],
  controllers: [LoggerController],
  exports: [LoggerService],
})
export class LoggerModule {}
