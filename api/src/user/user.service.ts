import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { LoggerService } from 'src/logger/logger.service';
import { EditUserInfoDTO } from './dto/user-info-dto';
import { SupabaseService } from 'src/supabase/supabase.service';
import { IUser } from 'src/interfaces/user.interface';
import { IAccount } from 'src/interfaces/account.interface';
import { IPrivacySettings } from 'src/interfaces/privacy-settings.interface';
import { IBlockList } from 'src/interfaces/blocklist.interface';
import { IFriendship } from 'src/interfaces/friendship.interface';

@Injectable()
export class UserService {
  constructor(
    private readonly logger: LoggerService,
    private readonly supabase: SupabaseService,
  ) {}

  // User Information Functions
  async gel_all_users(): Promise<
    { success: boolean; users: IUser[] } | HttpException
  > {
    try {
      const { data: users } = (await this.supabase
        .getClient()
        .from('users')
        .select('*')) as { data: IUser[] };

      const mapped_users = users.map(async (user) => {
        const { data: account } = (await this.supabase
          .getClient()
          .from('accounts')
          .select('*')
          .eq('user_id', user.id)
          .single()) as { data: IAccount };

        return {
          ...user,
          account: {
            ...account,
          },
        };
      });

      return {
        success: true,
        users: await Promise.all(mapped_users),
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

  async get_user_by_id(id: string): Promise<
    | {
        success: boolean;
        user: IUser;
        account: IAccount;
        privacy_settings: IPrivacySettings;
      }
    | HttpException
  > {
    try {
      const { data: user } = (await this.supabase
        .getClient()
        .from('users')
        .select(
          'id, first_name, last_name, username, email, gender, created_at',
        )
        .eq('id', id)
        .single()) as { data: IUser };

      const { data: account } = (await this.supabase
        .getClient()
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .single()) as { data: IAccount };

      const { data: privacy_settings } = (await this.supabase
        .getClient()
        .from('privacy_settings')
        .select('*')
        .eq('account_id', account.id)
        .single()) as { data: IPrivacySettings };

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

  async get_user_by_username(username: string): Promise<
    | {
        success: boolean;
        user: IUser;
        account: IAccount;
        privacy_settings: IPrivacySettings;
      }
    | HttpException
  > {
    try {
      const { data: user } = (await this.supabase
        .getClient()
        .from('users')
        .select(
          'id, first_name, last_name, username, email, gender, created_at',
        )
        .eq('username', username)
        .single()) as { data: IUser };

      const { data: account } = (await this.supabase
        .getClient()
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .single()) as { data: IAccount };

      const { data: privacy_settings } = (await this.supabase
        .getClient()
        .from('privacy_settings')
        .select('*')
        .eq('account_id', account.id)
        .single()) as { data: IPrivacySettings };

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
    req_user: IUser,
  ): Promise<{ success: boolean; message: string } | HttpException> {
    try {
      const { username } = userDTO;

      const userResponse = await this.get_user_by_id(req_user.id);
      if (userResponse instanceof HttpException) {
        return userResponse;
      }
      const user: IUser = userResponse.user;

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

      await this.supabase
        .getClient()
        .from('users')
        .update(userDTO)
        .eq('id', user.id);

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
  async get_block_list(req_user: IUser) {
    try {
      const { data: blockList } = await this.supabase
        .getClient()
        .from('block_lists')
        .select('*, blocked_id!inner(id, first_name, last_name, username)')
        .eq('blocker_id', req_user.id);

      const blocks: IBlockList[] = blockList ?? [];
      const mappedBlockList = [];

      for (const block of blocks) {
        const { data: account } = (await this.supabase
          .getClient()
          .from('accounts')
          .select('*')
          .eq('user_id', block.blocked_id)
          .single()) as { data: IAccount };

        const blockedUser = {
          id: block.id,
          blocked_id: block.blocked_id.id,
          first_name: block.blocked_id.first_name,
          last_name: block.blocked_id.last_name,
          username: block.blocked_id.username,
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

  async get_blocker_list(req_user: IUser) {
    try {
      const { data: blockList } = await this.supabase
        .getClient()
        .from('block_lists')
        .select('*, blocker_id!inner(id, first_name, last_name, username)')
        .eq('blocked_id', req_user.id);

      const blocks: IBlockList[] = blockList ?? [];
      const mappedBlockList = [];

      for (const block of blocks) {
        const { data: account } = (await this.supabase
          .getClient()
          .from('accounts')
          .select('*')
          .eq('user_id', block.blocker_id)
          .single()) as { data: IAccount };

        const blockedUser = {
          id: block.id,
          blocked_id: block.blocker_id.id,
          first_name: block.blocker_id.first_name,
          last_name: block.blocker_id.last_name,
          username: block.blocker_id.username,
          profile_picture: account ? account.profile_picture : null,
          created_at: block.created_at,
        };

        mappedBlockList.push(blockedUser);
      }

      return {
        success: true,
        blockerList: mappedBlockList,
      };
    } catch (error) {
      await this.logger.error(
        `Error getting block list by id\nError: ${error}`,
        'user',
        `User: ${req_user.id}`,
        error.stack,
      );
      return new InternalServerErrorException(
        'Failed to get block list - Due To Internal Server Error',
      );
    }
  }

  async block_user(id: string, req_user: IUser) {
    try {
      const userResponse = await this.get_user_by_id(id);
      if (userResponse instanceof HttpException) {
        return userResponse;
      }
      const user: IUser = userResponse.user;

      if (user.id === req_user.id) {
        return new BadRequestException({
          success: false,
          error: 'You cannot block yourself',
        });
      }

      const { data: isBlocked } = (await this.supabase
        .getClient()
        .from('block_lists')
        .select('*')
        .eq('blocker_id', req_user.id)
        .eq('blocked_id', user.id)
        .single()) as { data: IBlockList };

      if (isBlocked) {
        return new BadRequestException({
          success: false,
          error: 'You are already blocked by this user',
        });
      }

      const { data: isFriend } = (await this.supabase
        .getClient()
        .from('friendships')
        .select('*')
        .or(
          `and(requester_id.eq.${req_user.id},requestee_id.eq.${user.id}), and(requester_id.eq.${user.id},requestee_id.eq.${req_user.id})`,
        )
        .single()) as { data: IFriendship };

      if (isFriend) {
        await this.supabase
          .getClient()
          .from('friendships')
          .delete()
          .eq('id', isFriend.id);
      }

      await this.supabase
        .getClient()
        .from('block_lists')
        .insert({ blocker_id: req_user.id, blocked_id: user.id })
        .single();

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

  async unblock_user(id: string, req_user: IUser) {
    try {
      const userResponse = await this.get_user_by_id(id);
      if (userResponse instanceof HttpException) {
        return userResponse;
      }
      const user: IUser = userResponse.user;

      const { data: isBlocked } = (await this.supabase
        .getClient()
        .from('block_lists')
        .select('*')
        .eq('blocker_id', req_user.id)
        .eq('blocked_id', user.id)) as { data: IBlockList };

      if (!isBlocked) {
        return new BadRequestException({
          success: false,
          error: 'You are not blocked by this user',
        });
      }

      await this.supabase
        .getClient()
        .from('block_lists')
        .delete()
        .eq('blocked_id', user.id)
        .eq('blocker_id', req_user.id);

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
