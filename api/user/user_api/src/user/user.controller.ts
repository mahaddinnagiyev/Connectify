import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/jwt/jwt-auth-guard';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';
import { User } from 'src/entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Throttle({
    default: { limit: 60, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Get('/by')
  async get_user_by_id(@Req() req: Request) {
    const query = req.query;

    if (query.username) {
      return await this.userService.get_user_by_username(
        query.username.toString(),
      );
    }

    return await this.userService.get_user_by_id((req.user as User).id);
  }
}
