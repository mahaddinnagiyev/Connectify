import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../jwt/jwt-auth-guard';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { EditUserInfoDTO } from './dto/user-info-dto';
import { IUser } from '../interfaces/user.interface';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Throttle({
    default: { limit: 240, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Get('/all')
  async get_all_users() {
    return await this.userService.gel_all_users();
  }

  @UseGuards(JwtAuthGuard)
  @Throttle({
    default: { limit: 240, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Get('/by')
  async get_user_by_id(@Req() req: Request) {
    const query = req.query;

    if (query.username) {
      return await this.userService.get_user_by_username(
        query.username.toString(),
      );
    }

    if (query.id) {
      return await this.userService.get_user_by_id(query.id.toString());
    }
    return await this.userService.get_user_by_id((req.user as IUser).id);
  }

  @UseGuards(JwtAuthGuard)
  @Throttle({
    default: { limit: 240, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Patch('/my-profile')
  async edit_user_info(@Body() userDTO: EditUserInfoDTO, @Req() req: Request) {
    return await this.userService.edit_user_informations(
      userDTO,
      req.user as IUser,
    );
  }

  // Block List Functions
  @UseGuards(JwtAuthGuard)
  @Throttle({
    default: { limit: 240, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Get('/block-list')
  async get_block_list(@Req() req: Request, @Query('by') query: string) {
    if (query) {
      return await this.userService.get_blocker_list(req.user as IUser);
    }

    return await this.userService.get_block_list(req.user as IUser);
  }

  @UseGuards(JwtAuthGuard)
  @Throttle({
    default: { limit: 240, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Post('/block-list')
  async add_or_remove_from_block_list(
    @Req() req: Request,
    @Query('action') action: string,
    @Query('id') id: string,
  ) {
    if (action === 'add')
      return await this.userService.block_user(id, req.user as IUser);
    if (action === 'remove')
      return await this.userService.unblock_user(id, req.user as IUser);
  }
}
