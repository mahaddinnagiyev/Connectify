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

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private readonly logger: LoggerService,
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

      if (!Array.isArray(account.social_links)) {
        account.social_links = [];
      }

      const socialLinkIndex = account.social_links.findIndex(
        (linkObj) => linkObj.id === id,
      );

      if (socialLinkIndex === -1) {
        await this.logger.warn(
          `Social link not found in your account: ${JSON.stringify(
            socialLinkDTO,
          )}`,
          'account',
          `User: ${user.username}`,
        );
        return new BadRequestException({
          success: false,
          error: 'Social link not found in your account',
        });
      }

      account.social_links[socialLinkIndex].name = name
        ? name
        : account.social_links[socialLinkIndex].name;
      account.social_links[socialLinkIndex].link = link
        ? link
        : account.social_links[socialLinkIndex].link;

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
}
