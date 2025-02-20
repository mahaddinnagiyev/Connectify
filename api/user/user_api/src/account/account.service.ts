import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/entities/account.entity';
import { LoggerService } from 'src/logger/logger.service';
import { Repository } from 'typeorm';
import { EditSocialLinkDTO, SocialLinkDTO } from './dto/social-link-dto';
import { User } from 'src/entities/user.entity';
import { v4 as uuid } from 'uuid';
import { EditAccountDTO } from './dto/account-info-dto';
import { SupabaseService } from 'src/supabase/supabase.service';
import { PrivacySettings } from 'src/entities/privacy-settings.entity';
import { UpdatePrivacySettingsDTO } from './dto/privacy-settings-dto';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(PrivacySettings)
    private privacySettingsRepository: Repository<PrivacySettings>,

    private readonly logger: LoggerService,
    private readonly supabase: SupabaseService,
  ) {}

  // Find Account By User
  async get_account_by_user(user: User): Promise<Account | HttpException> {
    try {
      const account = await this.accountRepository.findOne({
        where: { user: { id: user.id } },
      });

      if (!account) {
        return new NotFoundException({
          success: false,
          error: 'Account not found',
        });
      }

      return account;
    } catch (error) {
      return new InternalServerErrorException(
        'Account could not find - Due To Internal Server Error',
      );
    }
  }

  // Edit Account
  async edit_account(
    accountDTO: EditAccountDTO,
    user: User,
  ): Promise<{ success: boolean; message: string } | HttpException> {
    try {
      const account = (await this.get_account_by_user(user)) as Account;

      if (account instanceof HttpException) {
        return new NotFoundException({
          success: false,
          error: 'Account not found',
        });
      }

      await this.accountRepository.update(account.id, accountDTO);

      return {
        success: true,
        message: 'Personal information updated successfully',
      };
    } catch (error) {
      await this.logger.error(
        error.message,
        'account',
        'There is an error editing account',
        error.stack,
      );
      return new InternalServerErrorException(
        'Failed to edit personal information - Due To Internal Server Error',
      );
    }
  }

  // Get Social Link By Id
  async get_social_by_id(
    id: string,
    user: User,
  ): Promise<
    | {
        success: boolean;
        social_link: { id: string; name: string; link: string };
      }
    | HttpException
  > {
    try {
      const account = (await this.get_account_by_user(user)) as Account;

      const social_link = account.social_links.find((link) => link.id === id);

      if (!social_link) {
        return new NotFoundException({
          success: false,
          error: 'Social link not found',
        });
      }

      return {
        success: true,
        social_link: {
          id: social_link.id,
          name: social_link.name,
          link: social_link.link,
        },
      };
    } catch (error) {
      await this.logger.error(
        error.message,
        'account',
        'There is an error getting social link by id',
        error.stack,
      );
      return new InternalServerErrorException(
        'Getting social link by id failed - Due To Internal Server Error',
      );
    }
  }

  // Add New Social Links
  async add_social_link(
    socialLinkDTO: SocialLinkDTO,
    user: User,
  ): Promise<{ success: boolean; message: string } | HttpException> {
    try {
      const { name, link } = socialLinkDTO;

      const account = (await this.get_account_by_user(user)) as Account;

      if (!Array.isArray(account?.social_links)) {
        account.social_links = [];
      }

      let isLinkExist = false;
      account.social_links.forEach((linkObj) => {
        if (linkObj.name === name) {
          isLinkExist = true;
        } else if (linkObj.link === link) {
          isLinkExist = true;
        }
      });

      if (isLinkExist) {
        await this.logger.warn(
          `Link or its name already exist in your account: ${JSON.stringify(
            socialLinkDTO,
          )}`,
          'account',
          `User: ${user.username}`,
        );
        return new BadRequestException({
          success: false,
          error: 'Link or its name already exist in your account',
        });
      }

      account.social_links.push({
        id: uuid(),
        name: name,
        link: link,
      });

      await this.accountRepository.save(account);
      await this.logger.info(
        `Social link added: ${JSON.stringify(socialLinkDTO)} by user: ${user.username}`,
        'account',
        `User: ${user.username}`,
      );

      return {
        success: true,
        message: 'Social link added successfully',
      };
    } catch (error) {
      console.log(error);
      await this.logger.error(
        error.message,
        'account',
        'There is an error adding social link',
        error.stack,
      );
      return new InternalServerErrorException(
        'Adding new social link failed - Due To Internal Server Error',
      );
    }
  }

  // Edit Social Link
  async edit_social_link(
    socialLinkDTO: EditSocialLinkDTO,
    id: string,
    user: User,
  ): Promise<{ success: boolean; message: string } | HttpException> {
    try {
      const { name, link } = socialLinkDTO;

      const account = (await this.get_account_by_user(user)) as Account;
      if (!account) {
        return new NotFoundException({
          success: false,
          error: 'Account not found',
        });
      }

      if (!Array.isArray(account.social_links)) {
        account.social_links = [];
      }

      const socialLinkIndex = account.social_links.findIndex(
        (linkObj) => linkObj.id === id,
      );
      if (socialLinkIndex === -1) {
        await this.logger.warn(
          `Social link not found in your account: ${JSON.stringify(socialLinkDTO)}`,
          'account',
          `User: ${user.username}`,
        );
        return new BadRequestException({
          success: false,
          error: 'Social link not found in your account',
        });
      }

      const duplicate = account.social_links.find((linkObj) => {
        return (
          linkObj.id !== id && (linkObj.name === name || linkObj.link === link)
        );
      });
      if (duplicate) {
        await this.logger.warn(
          `Social link with same name or link already exists: ${JSON.stringify(socialLinkDTO)}`,
          'account',
          `User: ${user.username}`,
        );
        return new BadRequestException({
          success: false,
          error: 'Link or its name already exists in your account',
        });
      }

      account.social_links[socialLinkIndex] = {
        ...account.social_links[socialLinkIndex],
        name,
        link,
      };

      await this.accountRepository.save(account);

      await this.logger.info(
        `Social link edited: ${JSON.stringify(socialLinkDTO)} by user: ${user.username}`,
        'account',
        `User: ${user.username}`,
      );

      return {
        success: true,
        message: 'Social link edited successfully',
      };
    } catch (error) {
      await this.logger.error(
        error.message,
        'account',
        'There is an error editing social link',
        error.stack,
      );
      return new InternalServerErrorException(
        'Editing social link failed - Due To Internal Server Error',
      );
    }
  }

  // Remove Social Link
  async delete_social_link(id: string, user: User) {
    try {
      const account = (await this.get_account_by_user(user)) as Account;

      if (!Array.isArray(account.social_links)) {
        account.social_links = [];
      }

      const socialLinkIndex = account.social_links.findIndex(
        (linkObj) => linkObj.id === id,
      );

      if (socialLinkIndex === -1) {
        await this.logger.warn(
          `Social link not found in your account: ${id}`,
          'account',
          `User: ${user.username}`,
        );
        return new BadRequestException({
          success: false,
          error: 'Social link not found in your account',
        });
      }

      const new_social_links = account.social_links.filter(
        (linkObj) => linkObj.id !== id,
      );

      await this.accountRepository.save({
        ...account,
        social_links: new_social_links,
      });
      await this.logger.info(
        `Social link deleted: ${id} by user: ${user.username}`,
        'account',
        `User: ${user.username}`,
      );

      return {
        success: true,
        message: 'Social link deleted successfully',
      };
    } catch (error) {
      await this.logger.error(
        error.message,
        'account',
        'There is an error deleting social link',
        error.stack,
      );
      return new InternalServerErrorException(
        'Deleting social link failed - Due To Internal Server Error',
      );
    }
  }

  // Upload Image
  async upload_image(file: Express.Multer.File) {
    try {
      let fileOriginalName: string;

      if (file.originalname.includes(' ')) {
        fileOriginalName = file.originalname.replace(' ', '-');
      }

      const fileName = `${uuid()}-${Date.now()}-${fileOriginalName}`;

      const { data, error } = await this.supabase
        .getClient()
        .storage.from('profile_pictures')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) {
        await this.logger.error(
          error.message,
          'account',
          'There is an error uploading image',
          error.stack,
        );
        return new BadRequestException({
          success: false,
          error: error.message,
        });
      }

      const publicUrl = this.supabase
        .getClient()
        .storage.from('profile_pictures')
        .getPublicUrl(fileName);

      return publicUrl.data.publicUrl;
    } catch (error) {
      await this.logger.error(
        error.message,
        'account',
        'There is an error uploading image',
        error.stack,
      );
      return new InternalServerErrorException(
        'Uploading image failed - Due To Internal Server Error',
      );
    }
  }

  // Update Profile Photo
  async update_profile_pic(
    req_user: User,
    file: Express.Multer.File,
  ): Promise<{ success: boolean; message: string } | HttpException> {
    try {
      const account = (await this.get_account_by_user(req_user)) as Account;

      if (account instanceof HttpException) {
        await this.logger.warn(
          'Account not found',
          'account',
          `User: ${req_user.username}`,
        );
        return new NotFoundException({
          success: false,
          error: 'Account not found',
        });
      }

      const imageUrl = await this.upload_image(file);

      if (imageUrl instanceof HttpException) {
        await this.logger.error(
          'Image upload failed',
          'account',
          `User: ${req_user.username}`,
        );
        return new BadRequestException({
          success: false,
          error: 'Image upload failed',
        });
      }

      if (account.profile_picture) {
        const url = account.profile_picture;
        const photoName = url.substring(url.lastIndexOf('/') + 1);
        const { data, error } = await this.supabase
          .getClient()
          .storage.from('profile_pictures')
          .remove([photoName]);

        if (error) {
          await this.logger.error(
            'Error deleting old profile picture',
            'account',
            error.message,
            error.stack,
          );

          return new BadRequestException({
            success: false,
            error: error.message,
          });
        }
      }

      await this.accountRepository.update(account.id, {
        profile_picture: imageUrl,
      });

      await this.logger.info(
        `Profile photo updated by user: ${req_user.username}`,
        'account',
        `User: ${req_user.username}`,
      );

      return {
        success: true,
        message: 'Profile photo updated successfully',
      };
    } catch (error) {
      await this.logger.error(
        error.message,
        'account',
        'There is an error updating profile photo',
        error.stack,
      );
      return new InternalServerErrorException(
        'Updating profile photo failed - Due To Internal Server Error',
      );
    }
  }

  // Update Privacy Settings
  async update_privacy_settings(
    privacy_settings: UpdatePrivacySettingsDTO,
    req_user: User,
  ) {
    try {
      const account = await this.get_account_by_user(req_user);

      if (account instanceof HttpException) {
        return account;
      }

      const privacy = await this.privacySettingsRepository.findOne({
        where: { account: { id: account.id } },
      });

      if (!privacy) {
        await this.logger.warn(
          'Privacy not found',
          'account',
          `User: ${req_user.username}`,
        );
        return new NotFoundException({
          success: false,
          error: 'Privacy Not Found',
        });
      }

      await this.privacySettingsRepository.update(privacy.id, privacy_settings);

      await this.logger.info(
        `${req_user.username} updated privacy settings`,
        'account',
        `User: ${req_user.username}`,
      );

      return {
        success: true,
        message: 'Privacy settings updated',
      };
    } catch (error) {
      await this.logger.error(
        error.message,
        'account',
        'There was an error in update privacy settings',
        error.stack,
      );
      return new InternalServerErrorException(
        'Failed to update privacy settings - Due to Internal Server Error',
      );
    }
  }
}
