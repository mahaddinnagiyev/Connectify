import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { Request } from 'express';
import { User } from 'src/entities/user.entity';
import { JwtAuthGuard } from 'src/jwt/jwt-auth-guard';

@Controller('friendship')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/requests')
  async getFriendshipRequests(@Req() req: Request) {
    return await this.friendshipService.getFriendshipRequests(req.user as User);
  }

  @UseGuards(JwtAuthGuard)
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
  @Post('/request')
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
    }

    return await this.friendshipService.rejectFriendship(id, req.user as User);
  }
}
