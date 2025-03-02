import { Module } from '@nestjs/common';
import { WebpushService } from './webpush.service';
import { SupabaseService } from 'src/supabase/supabase.service';
import { WebpushController } from './webpush.controller';
import { JwtStrategy } from 'src/jwt/jwt-strategy';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [WebpushService, SupabaseService, JwtStrategy],
  exports: [WebpushService],
  controllers: [WebpushController],
})
export class WebpushModule {}
