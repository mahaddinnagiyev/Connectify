import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Req } from '@nestjs/common';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
      passReqToCallback: true,
    });
  }

  async validate(
    @Req() req: Request,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      profile_picture: photos[0].value,
      accessToken,
    };

    const authenticatedUser = await this.authService.validateGoogleUser(user, ip as string);
    done(null, authenticatedUser);
  }
}
