import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './jwt-payload';
import { User } from 'src/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
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

    const user = await this.userRepository.findOne({
      where: { id: payload.id },
    });
    
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
