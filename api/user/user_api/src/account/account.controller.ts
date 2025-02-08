import {
  Body,
  Controller,
  Delete,
  HttpException,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { JwtAuthGuard } from 'src/jwt/jwt-auth-guard';
import { Throttle } from '@nestjs/throttler';
import { EditSocialLinkDTO, SocialLinkDTO } from './dto/social-link-dto';
import { Request } from 'express';
import { User } from 'src/entities/user.entity';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}


  // Add New Social Link
  @UseGuards(JwtAuthGuard)
  @Throttle({
    default: { limit: 60, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Patch('/social-link')
  async add_social_link(
    @Body() socialLinkDTO: SocialLinkDTO,
    @Req() req: Request,
  ): Promise<{ success: boolean; message: string } | HttpException> {
    return await this.accountService.add_social_link(
      socialLinkDTO,
      req.user as User,
    );
  }


  // Edit Social Link
  @UseGuards(JwtAuthGuard)
  @Throttle({
    default: { limit: 60, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Patch('/social-link/:id')
  async edit_social_link(
    @Body() socialLinkDTO: EditSocialLinkDTO,
    @Req() req: Request,
  ): Promise<{ success: boolean; message: string } | HttpException> {
    return await this.accountService.edit_social_link(
      socialLinkDTO,
      String(req.params.id),
      req.user as User,
    );
  }


  // Delte Social Link
  @UseGuards(JwtAuthGuard)
  @Throttle({
    default: { limit: 60, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Delete('/social-link/:id')
  async delete_social_link(
    @Req() req: Request,
  ): Promise<{ success: boolean; message: string } | HttpException> {
    return await this.accountService.delete_social_link(
      String(req.params.id),
      req.user as User,
    );
  }
}
