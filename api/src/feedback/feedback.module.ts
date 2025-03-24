import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { LoggerModule } from 'src/logger/logger.module';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Module({
  imports: [LoggerModule, SupabaseModule],
  providers: [FeedbackService],
  controllers: [FeedbackController],
})
export class FeedbackModule {}
