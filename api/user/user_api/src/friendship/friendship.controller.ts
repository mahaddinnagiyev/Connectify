import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { Request } from 'express';
import { User } from 'src/entities/user.entity';
import { JwtAuthGuard } from 'src/jwt/jwt-auth-guard';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('friendship')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @UseGuards(JwtAuthGuard)
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: { limit: 240, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Get('/requests/all')
  async getAllFriendshipRequests(@Req() req: Request) {
    return await this.friendshipService.getAllFriendshipRequests(
      req.user as User,
    );
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: { limit: 240, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Get('/my-friends')
  async getFriends(@Req() req: Request) {
    return await this.friendshipService.getFriends(req.user as User);
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: { limit: 240, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Get('/requests')
  async getFriendshipRequests(@Req() req: Request) {
    return await this.friendshipService.getFriendshipRequests(req.user as User);
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: { limit: 240, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Post('/request/create')
  async createFriendship(
    @Req() req: Request,
    @Query('requestee') requestee: string,
  ) {
    return await this.friendshipService.createFriendship(
      requestee,
      req.user as User,
    );
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: { limit: 240, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Patch('/request')
  async acceptAndRejectFriendship(
    @Req() req: Request,
    @Query('status') status: string,
    @Query('request') id: string,
  ) {
    if (status === 'accept') {
      return await this.friendshipService.acceptFriendship(
        id,
        req.user as User,
      );
    } else if (status === 'reject') {
      return await this.friendshipService.rejectFriendship(
        id,
        req.user as User,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: { limit: 240, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Delete('/request/remove')
  async removeFriendship(@Req() req: Request, @Query('request') id: string) {
    return await this.friendshipService.removeFriendship(id, req.user as User);
  }
}
