import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { ITokenBlackList } from '../interfaces/token-black-list.interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly supabase: SupabaseService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        success: false,
        message: 'Token is missing or invalid',
      });
    }

    const token = request.headers.authorization?.split(' ')[1];

    if (token) {
      const { data: blackListedToken } = (await this.supabase
        .getClient()
        .from('token_black_list')
        .select('*')
        .eq('token', token)
        .single()) as { data: ITokenBlackList };

      if (blackListedToken) {
        throw new UnauthorizedException({
          success: false,
          message: 'Token is invalid or expired',
        });
      }
    }

    const isAuthorized = (await super.canActivate(context)) as boolean;
    return isAuthorized;
  }
}
