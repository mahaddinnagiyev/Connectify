import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import * as webPush from 'web-push';

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
      const { data, error } = await this.supabase
        .getClient()
        .from('push_subscriptions')
        .upsert({ user_id: userId, subscription });

      if (error) throw new Error(error.message);

      return data;
    } catch (error) {
      return new InternalServerErrorException(
        'Failed to save subscription - Due To Internal Server Error',
      );
    }
  }

  async sendPushNotification(userId: string, payload: any) {
    try {
      const { data: subscriptions } = await this.supabase
        .getClient()
        .from('push_subscriptions')
        .select('subscription')
        .eq('user_id', userId);

      if (!subscriptions) return;

      const notifications = subscriptions.map((sub) =>
        webPush.sendNotification(sub.subscription, JSON.stringify(payload)),
      );

      return Promise.allSettled(notifications);
    } catch (error) {
      return new InternalServerErrorException(
        'Failed to send push notification - Due To Internal Server Error',
      );
    }
  }
}
