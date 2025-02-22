import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './jwt-payload';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly supabase: SupabaseService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET_KEY!,
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

    const { data: user } = await this.supabase
      .getUserClient()
      .from('users')
      .select(
        'id, first_name, last_name, username, email, gender, is_banned, created_at',
      )
      .eq('id', id)
      .single();

    if (!user) {
      return new UnauthorizedException({
        success: false,
        error: 'User not found or invalid token',
      });
    }

    return user;
  }
}
