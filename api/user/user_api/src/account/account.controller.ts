import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  HttpException,
  Patch,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { JwtAuthGuard } from 'src/jwt/jwt-auth-guard';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { EditSocialLinkDTO, SocialLinkDTO } from './dto/social-link-dto';
import { Request } from 'express';
import { User } from 'src/entities/user.entity';
import { EditAccountDTO } from './dto/account-info-dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdatePrivacySettingsDTO } from './dto/privacy-settings-dto';

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
    return await this.accountService.edit_account(userDTO, req.user as User);
  }

  // Get Social Link By Id
  @UseGuards(JwtAuthGuard)
  @Throttle({
    default: { limit: 240, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Get('/social-link/:id')
  async get_social_by_id(@Req() req: Request) {
    return await this.accountService.get_social_by_id(
      String(req.params.id),
      req.user as User,
    );
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
      req.user as User,
    );
  }

  // Edit Social Link
  @UseGuards(JwtAuthGuard)
  @Throttle({
    default: { limit: 240, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Patch('/social-link/:id')
  async edit_social_link(
    @Body() socialLinkDTO: EditSocialLinkDTO,
    @Req() req: Request,
  ) {
    return await this.accountService.edit_social_link(
      socialLinkDTO,
      String(req.params.id),
      req.user as User,
    );
  }

  // Delte Social Link
  @UseGuards(JwtAuthGuard)
  @Throttle({
    default: { limit: 240, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Delete('/social-link/:id')
  async delete_social_link(@Req() req: Request) {
    return await this.accountService.delete_social_link(
      String(req.params.id),
      req.user as User,
    );
  }

  // Update Profile Photo
  @Patch('/profile-pic')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('profile_picture'))
  async update_profile_pic(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.accountService.update_profile_pic(req.user as User, file);
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
      req.user as User,
      privacy_settings,
    );
  }
}
