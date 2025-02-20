import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/entities/account.entity';
import { User } from 'src/entities/user.entity';
import { LoggerService } from 'src/logger/logger.service';
import { Repository } from 'typeorm';
import { EditUserInfoDTO } from './dto/user-info-dto';
import { BlockList } from 'src/entities/blocklist.entity';
import { Friendship } from 'src/entities/friendship.entity';
import { PrivacySettings } from 'src/entities/privacy-settings.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(BlockList)
    private blockListRepository: Repository<BlockList>,
    @InjectRepository(Friendship)
    private friendshipRepository: Repository<Friendship>,
    @InjectRepository(PrivacySettings)
    private privacySettingsRepository: Repository<PrivacySettings>,

    private readonly logger: LoggerService,
  ) {}

  // User Information Functions
  async gel_all_users(): Promise<
    { success: boolean; users: User[] } | HttpException
  > {
    try {
      const users = await this.userRepository.find({
        select: [
          'id',
          'first_name',
          'last_name',
          'username',
          'email',
          'gender',
          'created_at',
        ],
        relations: ['account'],
      });

      return {
        success: true,
        users,
      };
    } catch (error) {
      await this.logger.error(
        error.message,
        'user',
        'There was an error getting all users',
        error.stack,
      );
      return new InternalServerErrorException(
        'Failed to get all users - Due To Internal Server Error',
      );
    }
  }

  async get_user_by_id(
    id: string,
  ): Promise<
    | {
        success: boolean;
        user: User;
        account: Account;
        privacy_settings: PrivacySettings;
      }
    | HttpException
  > {
    try {
      const user: User = await this.userRepository.findOne({
        where: { id: id },
        select: [
          'id',
          'first_name',
          'last_name',
          'username',
          'email',
          'gender',
          'created_at',
        ],
      });

      const account: Account = await this.accountRepository.findOne({
        where: { user: { id: id } },
      });

      const privacy_settings: PrivacySettings =
        await this.privacySettingsRepository.findOne({
          where: { account: { id: account.id } },
        });

      if (!(user && account && privacy_settings)) {
        return new NotFoundException({
          success: false,
          error: 'User not found',
        });
      }

      return {
        success: true,
        user,
        account,
        privacy_settings,
      };
    } catch (error) {
      await this.logger.error(
        `Error getting user by id: ${id}\nError: ${error}`,
        'user',
      );
      return new InternalServerErrorException(
        'Finding user by id failed - Due To Internal Server Error',
      );
    }
  }

  async get_user_by_username(
    username: string,
  ): Promise<
    | {
        success: boolean;
        user: User;
        account: Account;
        privacy_settings: PrivacySettings;
      }
    | HttpException
  > {
    try {
      const user: User = await this.userRepository.findOne({
        where: { username: username },
        select: [
          'id',
          'first_name',
          'last_name',
          'username',
          'email',
          'gender',
          'created_at',
        ],
      });

      const account: Account = await this.accountRepository.findOne({
        where: { user: { id: user.id } },
      });

      const privacy_settings: PrivacySettings =
        await this.privacySettingsRepository.findOne({
          where: { account: { id: account.id } },
        });

      if (!(user && account && privacy_settings)) {
        return new NotFoundException({
          success: false,
          error: 'User not found',
        });
      }

      return {
        success: true,
        user,
        account,
        privacy_settings,
      };
    } catch (error) {
      await this.logger.error(
        `Error getting user by username: ${username}\nError: ${error}`,
        'user',
      );
      return new InternalServerErrorException(
        'Failed to find user - Due To Internal Server Error',
      );
    }
  }

  async edit_user_informations(
    userDTO: EditUserInfoDTO,
    req_user: User,
  ): Promise<{ success: boolean; message: string } | HttpException> {
    try {
      const { username } = userDTO;

      const userResponse = await this.get_user_by_id(req_user.id);
      if (userResponse instanceof HttpException) {
        return userResponse;
      }
      const user: User = userResponse.user;

      if (username) {
        const usernameResponse = await this.get_user_by_username(username);
        if (
          !(usernameResponse instanceof HttpException) &&
          user.id !== usernameResponse.user.id
        ) {
          await this.logger.warn(
            `Username already taken: ${username}`,
            'user',
            `User: ${req_user.username}`,
          );
          return new BadRequestException({
            success: false,
            error: 'Username already taken',
          });
        }
      }

      await this.userRepository.update(user.id, userDTO);

      await this.logger.info(
        `User informations edited: ${JSON.stringify(userDTO)}`,
        'user',
        `User: ${req_user.username}`,
      );

      return {
        success: true,
        message: 'Informations edited successfully',
      };
    } catch (error) {
      await this.logger.error(
        `Error editing user informations\nError: ${error}`,
        'user',
        `User: ${req_user.username}`,
        error.stack,
      );
      return new InternalServerErrorException(
        'Failed to edit informations - Due To Internal Server Error',
      );
    }
  }

  // Block List Functions
  async get_block_list(req_user: User) {
    try {
      const blockList = await this.blockListRepository.find({
        where: { blocker: { id: req_user.id } },
        relations: ['blocked'],
        select: ['id', 'blocked', 'created_at'],
      });

      const mappedBlockList = [];

      for (const block of blockList) {
        const account = await this.accountRepository.findOne({
          where: { user: { id: block.blocked.id } },
        });

        const blockedUser = {
          id: block.blocked.id,
          blocked_id: block.blocked.id,
          first_name: block.blocked.first_name,
          last_name: block.blocked.last_name,
          username: block.blocked.username,
          profile_picture: account ? account.profile_picture : null,
          created_at: block.created_at,
        };

        mappedBlockList.push(blockedUser);
      }

      return {
        success: true,
        blockList: mappedBlockList,
      };
    } catch (error) {
      console.log(error);
      await this.logger.error(
        `Error getting block list\nError: ${error}`,
        'user',
        `User: ${req_user.id}`,
        error.stack,
      );
      return new InternalServerErrorException(
        'Failed to get block list - Due To Internal Server Error',
      );
    }
  }

  async block_user(id: string, req_user: User) {
    try {
      const userResponse = await this.get_user_by_id(id);
      if (userResponse instanceof HttpException) {
        return userResponse;
      }
      const user: User = userResponse.user;

      if (user.id === req_user.id) {
        return new BadRequestException({
          success: false,
          error: 'You cannot block yourself',
        });
      }

      const isBlocked = await this.blockListRepository.findOne({
        where: {
          blocker: { id: req_user.id },
          blocked: { id: user.id },
        },
      });

      if (isBlocked) {
        return new BadRequestException({
          success: false,
          error: 'You are already blocked by this user',
        });
      }

      const isFriend = await this.friendshipRepository.findOne({
        where: [
          {
            requester: { id: req_user.id },
            requestee: { id: user.id },
          },
          {
            requester: { id: user.id },
            requestee: { id: req_user.id },
          },
        ],
      });

      if (isFriend) {
        await this.friendshipRepository.remove(isFriend);
      }

      await this.blockListRepository.save({
        blocker: { id: req_user.id },
        blocked: { id: user.id },
      });

      await this.logger.info(
        `User blocked: ${user.username}`,
        'user',
        `User: ${req_user.id}`,
      );

      return {
        success: true,
        message: `${user.username} blocked`,
      };
    } catch (error) {
      await this.logger.error(
        `Error blocking user: ${id}\nError: ${error}`,
        'user',
        `User: ${req_user.id}`,
        error.stack,
      );
      return new InternalServerErrorException(
        'Failed to block user - Due To Internal Server Error',
      );
    }
  }

  async unblock_user(id: string, req_user: User) {
    try {
      const userResponse = await this.get_user_by_id(id);
      if (userResponse instanceof HttpException) {
        return userResponse;
      }
      const user: User = userResponse.user;

      const isBlocked = await this.blockListRepository.findOne({
        where: {
          blocker: { id: req_user.id },
          blocked: { id: user.id },
        },
      });

      if (!isBlocked) {
        return new BadRequestException({
          success: false,
          error: 'You are not blocked by this user',
        });
      }

      await this.blockListRepository.delete({
        blocker: { id: req_user.id },
        blocked: { id: user.id },
      });

      await this.logger.info(
        `User unblocked: ${user.username}`,
        'user',
        `User: ${req_user.id}`,
      );

      return {
        success: true,
        message: `${user.username} unblocked: `,
      };
    } catch (error) {
      await this.logger.error(
        `Error unblocking user: ${id}\nError: ${error}`,
        'user',
        `User: ${req_user.id}`,
        error.stack,
      );
      return new InternalServerErrorException(
        'Failed to unblock user - Due To Internal Server Error',
      );
    }
  }
}
