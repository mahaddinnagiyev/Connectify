import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './jwt-payload';
import { SupabaseService } from '../supabase/supabase.service';
import { IUser } from '../interfaces/user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly supabase: SupabaseService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET_KEY,
    });
  }

  async validate(payload: JwtPayload) {
    const { id } = payload;

    if (!id) {
      return new UnauthorizedException({
        success: false,
        error: 'User not found or invalid token',
      });
    }

    const { data: user } = (await this.supabase
      .getClient()
      .from('users')
      .select('*')
      .eq('id', id)
      .single()) as { data: IUser };

    if (!user) {
      return new UnauthorizedException({
        success: false,
        error: 'User not found or invalid token',
      });
    }

    const { password, ...safeUser } = user;

    return safeUser;
  }
}
