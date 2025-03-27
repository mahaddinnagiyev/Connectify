import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Patch,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Param,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { JwtAuthGuard } from '../jwt/jwt-auth-guard';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { EditSocialLinkDTO, SocialLinkDTO } from './dto/social-link-dto';
import { Request } from 'express';
import { EditAccountDTO } from './dto/account-info-dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdatePrivacySettingsDTO } from './dto/privacy-settings-dto';
import { IUser } from '../interfaces/user.interface';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  // Edit Account
  @UseGuards(JwtAuthGuard)
  @Throttle({
    default: { limit: 240, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Patch('/my-info')
  async edit_account(@Body() userDTO: EditAccountDTO, @Req() req: Request) {
    return await this.accountService.edit_account(userDTO, req.user as IUser);
  }

  // Get Social Link By Id
  @UseGuards(JwtAuthGuard)
  @Throttle({
    default: { limit: 240, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Get('/social-link/:id')
  async get_social_by_id(@Param('id') id: string, @Req() req: Request) {
    return await this.accountService.get_social_by_id(id, req.user as IUser);
  }

  // Add New Social Link
  @UseGuards(JwtAuthGuard)
  @Throttle({
    default: { limit: 240, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Post('/social-link')
  async add_social_link(
    @Body() socialLinkDTO: SocialLinkDTO,
    @Req() req: Request,
  ) {
    return await this.accountService.add_social_link(
      socialLinkDTO,
      req.user as IUser,
    );
  }

  // Edit Social Link
  @UseGuards(JwtAuthGuard)
  @Throttle({
    default: { limit: 240, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Patch('/social-link/:id')
  async edit_social_link(
    @Param('id') id: string,
    @Body() socialLinkDTO: EditSocialLinkDTO,
    @Req() req: Request,
  ) {
    return await this.accountService.edit_social_link(
      socialLinkDTO,
      id,
      req.user as IUser,
    );
  }

  // Delte Social Link
  @UseGuards(JwtAuthGuard)
  @Throttle({
    default: { limit: 240, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Delete('/social-link/:id')
  async delete_social_link(@Param('id') id: string, @Req() req: Request) {
    return await this.accountService.delete_social_link(id, req.user as IUser);
  }

  // Update Profile Photo
  @Patch('/profile-pic')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('profile_picture'))
  async update_profile_pic(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.accountService.update_profile_pic(
      req.user as IUser,
      file,
    );
  }

  // Update Privacy Settings
  @Patch('/privacy-settings')
  @UseGuards(JwtAuthGuard)
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: { limit: 120, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  async update_privacy_settings(
    @Body() privacy_settings: UpdatePrivacySettingsDTO,
    @Req() req: Request,
  ) {
    return await this.accountService.update_privacy_settings(
      privacy_settings,
      req.user as IUser,
    );
  }
}
