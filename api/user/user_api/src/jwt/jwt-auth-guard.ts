import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenBlackList } from 'src/entities/token-black-list.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    @InjectRepository(TokenBlackList)
    private tokenBlackListRepository: Repository<TokenBlackList>,
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
      const blackListedToken = await this.tokenBlackListRepository.findOne({
        where: { token: token },
      });

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
