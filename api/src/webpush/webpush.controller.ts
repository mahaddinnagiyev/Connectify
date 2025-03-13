import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { WebpushService } from './webpush.service';
import { JwtAuthGuard } from 'src/jwt/jwt-auth-guard';
import { Request } from 'express';
import { IUser } from 'src/interfaces/user.interface';

@Controller('api/webpush')
export class WebpushController {
  constructor(private readonly webPushService: WebpushService) {}

  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  async subscribe(@Req() req: Request, @Body() subscription: any) {
    const userId = (req.user as IUser).id;
    const result = await this.webPushService.saveSubscription(
      userId,
      subscription,
    );
    return result;
  }
}
