import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import * as webPush from 'web-push';
import { SubscriptionDTO } from './dto/subscription-dto';

@Injectable()
export class WebpushService {
  constructor(private readonly supabase: SupabaseService) {
    webPush.setVapidDetails(
      `mailto: ${process.env.VAPID_EMAIL}`,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY,
    );
  }

  async saveSubscription(userId: string, subscription: any) {
    try {
      console.log("service", subscription);
      const { data, error } = await this.supabase
        .getClient()
        .from('push_subscriptions')
        .upsert({ user_id: userId, subscription });

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.log(error);
      return new InternalServerErrorException(
        'Failed to save subscription - Due To Internal Server Error',
      );
    }
  }

  async sendPushNotification(userId: string, payload: any) {
    try {
      console.log("service webpush", payload);
      const { data: subscriptions, error } = await this.supabase
        .getClient()
        .from('push_subscriptions')
        .select('subscription')
        .eq('user_id', userId);

      if (error) console.log(error);
      console.log(subscriptions);
      if (!subscriptions) return;

      const notifications = subscriptions.map((sub) =>
        webPush.sendNotification(sub.subscription, JSON.stringify(payload)),
      );
      console.log(notifications);

      return Promise.allSettled(notifications);
    } catch (error) {
      console.log(error);
      return new InternalServerErrorException(
        'Failed to send push notification - Due To Internal Server Error',
      );
    }
  }
}
