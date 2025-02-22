import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { MessengerModule } from './messenger/messenger.module';

@Module({
  imports: [SupabaseModule, MessengerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
