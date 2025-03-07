import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { LoggerService } from 'src/logger/logger.service';
import { User } from 'src/entities/user.entity';
import { FriendshipStatus } from 'src/enums/friendship-status.enum';
import { SupabaseService } from 'src/supabase/supabase.service';
import { IUser } from 'src/interfaces/user.interface';
import { IFriendship } from 'src/interfaces/friendship.interface';
import { IBlockList } from 'src/interfaces/blocklist.interface';
import { IAccount } from 'src/interfaces/account.interface';

@Injectable()
export class FriendshipService {
  constructor(
    private readonly logger: LoggerService,
    private readonly supabase: SupabaseService,
  ) {}

  // Get All User's Friendship Requests
  async getAllFriendshipRequests(req_user: IUser) {
    try {
      const { data: friendships } = (await this.supabase
        .getClient()
        .from('friendships')
        .select(
          '*, requester_id!inner(id, first_name, last_name, username), requestee_id!inner(id, first_name, last_name, username)',
        )
        .or(
          `or(requester_id.eq.${req_user.id}), or(requestee_id.eq.${req_user.id})`,
        )) as { data: IFriendship[] };

      let mappedFriendships = [];

      for (const friendship of friendships) {
        const requestee =
          friendship.requester_id.id === req_user.id
            ? friendship.requestee_id
            : friendship.requester_id;

        const { data: account } = (await this.supabase
          .getClient()
          .from('accounts')
          .select('*')
          .eq('user_id', requestee.id)
          .single()) as { data: IAccount };

        const mappedFriendship = {
          id: friendship.id,
          friend_id: requestee.id,
          first_name: requestee.first_name,
          last_name: requestee.last_name,
          username: requestee.username,
          profile_picture: account.profile_picture
            ? account.profile_picture
            : null,
          status: friendship.status,
          created_at: friendship.created_at,
          updated_at: friendship.updated_at,
        };
        mappedFriendships.push(mappedFriendship);
      }

      return {
        success: true,
        friends: mappedFriendships,
      };
    } catch (error) {
      console.log(error);
      await this.logger.error(
        error,
        'friendship',
        'There is an error getting all friendship requests',
        error.stack,
      );
      return new InternalServerErrorException(
        'Failed to load friendship requests - Due To Internal Server Error',
      );
    }
  }

  // Get User Friends
  async getFriends(req_user: IUser) {
    try {
      const { data: friendships } = (await this.supabase
        .getClient()
        .from('friendships')
        .select(
          `*, requester_id!inner(id, first_name, last_name, username), requestee_id!inner(id, first_name, last_name, username)`,
        )
        .or(
          `requester_id.eq.${req_user.id},requestee_id.eq.${req_user.id}`,
        )) as { data: IFriendship[] };

      const mappedFriends = [];

      for (const friendship of friendships) {
        const friendUser =
          friendship.requester_id.id === req_user.id
            ? friendship.requestee_id
            : friendship.requester_id;

        const { data: account } = (await this.supabase
          .getClient()
          .from('accounts')
          .select('*')
          .eq('user_id', friendUser.id)
          .single()) as { data: IAccount };

        const friend = {
          id: friendship.id,
          friend_id: friendUser.id,
          first_name: friendUser.first_name,
          last_name: friendUser.last_name,
          username: friendUser.username,
          profile_picture: account.profile_picture
            ? account.profile_picture
            : null,
          status: friendship.status,
          created_at: friendship.created_at,
          updated_at: friendship.updated_at,
        };

        mappedFriends.push(friend);
      }

      return {
        success: true,
        friends: mappedFriends,
      };
    } catch (error) {
      console.log(error);
      await this.logger.error(
        error,
        'friendship',
        'There is an error getting friends',
        error.stack,
      );
      return new InternalServerErrorException(
        'Failed to load friends - Due To Internal Server Error',
      );
    }
  }

  // Get User Friendships Requests
  async getFriendshipRequests(req_user: IUser) {
    try {
      const { data: friendRequests } = (await this.supabase
        .getClient()
        .from('friendships')
        .select(
          '*, requester_id!inner(id, first_name, last_name, username), requestee_id!inner(id, first_name, last_name, username)',
        )
        .or(
          `and(requester_id.eq.${req_user.id},status.eq.${FriendshipStatus.pending}),and(requestee_id.eq.${req_user.id},status.eq.${FriendshipStatus.pending})`,
        )) as { data: IFriendship[] };

      if (!friendRequests) {
        return new NotFoundException({
          success: false,
          error: 'Friendship requests not found',
        });
      }

      let sentRequest: IFriendship[] = [];
      let receivedRequest: IFriendship[] = [];

      friendRequests.forEach((friendship) => {
        if (friendship.requester_id.id === req_user.id) {
          sentRequest.push(friendship);
        } else if (friendship.requestee_id.id === req_user.id) {
          receivedRequest.push(friendship);
        }
      });

      const mappedSentRequest = await Promise.all(
        sentRequest.map(async (friendship) => {
          const { data: requesteeAccount } = (await this.supabase
            .getClient()
            .from('accounts')
            .select('*')
            .eq('user_id', friendship.requestee_id.id)
            .single()) as { data: IAccount };

          return {
            id: friendship.id,
            requester: {
              id: friendship.requester_id.id,
              first_name: friendship.requester_id.first_name,
              last_name: friendship.requester_id.last_name,
              username: friendship.requester_id.username,
            },
            requestee: {
              id: friendship.requestee_id.id,
              first_name: friendship.requestee_id.first_name,
              last_name: friendship.requestee_id.last_name,
              username: friendship.requestee_id.username,
              profile_picture: requesteeAccount?.profile_picture || null,
            },
            status: friendship.status,
            created_at: friendship.created_at,
            updated_at: friendship.updated_at,
          };
        }),
      );

      const mappedReceivedRequest = await Promise.all(
        receivedRequest.map(async (friendship) => {
          const { data: requesterAccount } = (await this.supabase
            .getClient()
            .from('accounts')
            .select('*')
            .eq('user_id', friendship.requester_id.id)
            .single()) as { data: IAccount };

          return {
            id: friendship.id,
            requester: {
              id: friendship.requester_id.id,
              first_name: friendship.requester_id.first_name,
              last_name: friendship.requester_id.last_name,
              username: friendship.requester_id.username,
              profile_picture: requesterAccount?.profile_picture || null,
            },
            requestee: {
              id: friendship.requestee_id.id,
              first_name: friendship.requestee_id.first_name,
              last_name: friendship.requestee_id.last_name,
              username: friendship.requestee_id.username,
            },
            status: friendship.status,
            created_at: friendship.created_at,
            updated_at: friendship.updated_at,
          };
        }),
      );

      return {
        success: true,
        sentRequests: mappedSentRequest,
        receivedRequests: mappedReceivedRequest,
      };
    } catch (error) {
      await this.logger.error(
        error,
        'friendship',
        'There is an error getting friendship requests',
        error.stack,
      );
      return new InternalServerErrorException(
        'Failed to get friendship requests - Due To Internal Server Error',
      );
    }
  }

  // Create Friendship
  async createFriendship(requestee: string, req_user: IUser) {
    try {
      if (req_user.id === requestee) {
        return new BadRequestException({
          success: false,
          error: 'You cannot send a friendship request to yourself',
        });
      }

      const { data: isRequesteeBlocked } = (await this.supabase
        .getClient()
        .from('block_list')
        .select(
          '*, blocker_id!inner(id, first_name, last_name, username), blocked_id!inner(id, first_name, last_name, username)',
        )
        .eq('blocker_id', req_user.id)
        .eq('blocked_id', requestee)
        .single()) as { data: IBlockList };

      const { data: isRequesterBlocked } = (await this.supabase
        .getClient()
        .from('block_list')
        .select(
          '*, blocker_id!inner(id, first_name, last_name, username), blocked_id!inner(id, first_name, last_name, username)',
        )
        .eq('blocker_id', requestee)
        .eq('blocked_id', req_user.id)
        .single()) as { data: IBlockList };

      if (isRequesteeBlocked) {
        return new BadRequestException({
          success: false,
          error: 'You have blocked this user',
        });
      }

      if (isRequesterBlocked) {
        return new BadRequestException({
          success: false,
          error: 'This user has blocked you',
        });
      }

      const { data: requesteeUser } = (await this.supabase
        .getClient()
        .from('users')
        .select('id, first_name, last_name, username')
        .eq('id', requestee)
        .single()) as { data: IUser };

      if (!requesteeUser) {
        throw new NotFoundException('Requestee user not found');
      }

      const { data: isFriendshipExists } = (await this.supabase
        .getClient()
        .from('friendships')
        .select('*')
        .or(
          `and(requester_id.eq.${req_user.id},requestee_id.eq.${requestee}),and(requester_id.eq.${requestee},requestee_id.eq.${req_user.id})`,
        )
        .single()) as { data: IFriendship };

      if (isFriendshipExists) {
        return new BadRequestException({
          success: false,
          error: 'Friendship already exists',
        });
      }

      const { data: newFriendship } = (await this.supabase
        .getClient()
        .from('friendships')
        .insert({
          requester_id: req_user.id,
          requestee_id: requestee,
        })
        .single()) as { data: IFriendship };

      await this.logger.info(
        `Friendship has been created: ${JSON.stringify(newFriendship)}`,
        'friendship',
        `${req_user.username} sent a friendship request to ${requesteeUser.username}`,
      );

      return {
        success: true,
        message: 'Friendship request send',
      };
    } catch (error) {
      await this.logger.error(
        error,
        'friendship',
        `There is an error creating friendship`,
        error.stack,
      );
      return new InternalServerErrorException(
        'Failed to create friendship - Due To Internal Server Error',
      );
    }
  }

  // Accept Friendship Request
  async acceptFriendship(id: string, req_user: IUser) {
    try {
      const { data: friendship } = (await this.supabase
        .getClient()
        .from('friendships')
        .select(
          '*, requester_id!inner(id, first_name, last_name, username), requestee_id!inner(id, first_name, last_name, username)',
        )
        .or(`and(id.eq.${id},requestee_id.eq.${req_user.id})`)
        .single()) as { data: IFriendship };

      if (!friendship) {
        return new NotFoundException({
          success: false,
          error: 'Friendship not found',
        });
      }

      if (friendship.status !== FriendshipStatus.pending) {
        if (friendship.status === FriendshipStatus.accepted) {
          return {
            success: true,
            message: 'Friendship request already accepted',
          };
        } else if (friendship.status === FriendshipStatus.rejected) {
          return new BadRequestException({
            success: false,
            error: 'Friendship request already rejected',
          });
        } else {
          return new BadRequestException({
            success: false,
            error: 'Friendship request already blocked',
          });
        }
      }

      await this.supabase
        .getClient()
        .from('friendships')
        .update({
          status: FriendshipStatus.accepted,
        })
        .eq('id', id);

      await this.logger.info(
        `Friendship has been accepted: ${JSON.stringify(friendship)}`,
        'friendship',
        `${friendship.requestee_id.username} accepted a friendship request from ${friendship.requester_id.username}`,
      );

      return {
        success: true,
        message: `${friendship.requester_id.username} now is your friend`,
      };
    } catch (error) {
      console.log(error);
      await this.logger.error(
        error,
        'friendship',
        `There is an error accepting friendship`,
        error.stack,
      );
      return new InternalServerErrorException(
        'Failed to accept friendship - Due To Internal Server Error',
      );
    }
  }

  // Reject Friendship Request
  async rejectFriendship(id: string, req_user: IUser) {
    try {
      const { data: friendship } = (await this.supabase
        .getClient()
        .from('friendships')
        .select(
          '*, requester_id!inner(id, first_name, last_name, username), requestee_id!inner(id, first_name, last_name, username)',
        )
        .or(`and(id.eq.${id},requestee_id.eq.${req_user.id})`)
        .single()) as { data: IFriendship };

      if (!friendship) {
        return new NotFoundException({
          success: false,
          error: 'Friendship not found',
        });
      }

      if (friendship.status !== FriendshipStatus.pending) {
        if (friendship.status === FriendshipStatus.accepted) {
          return {
            success: true,
            message: 'Friendship request already accepted',
          };
        } else if (friendship.status === FriendshipStatus.blocked) {
          return new BadRequestException({
            success: false,
            error: 'Friendship request already blocked',
          });
        }
      }

      await this.supabase.getClient().from('friendships').delete().eq('id', id);

      await this.logger.info(
        `Friendship has been rejected: ${JSON.stringify(friendship)}`,
        'friendship',
        `${friendship.requestee_id.username} rejected a friendship request from ${friendship.requester_id.username}`,
      );

      return {
        success: true,
        message: `${friendship.requester_id.username}'s friend request rejected`,
      };
    } catch (error) {
      await this.logger.error(
        error,
        'friendship',
        `There is an error rejecting friendship`,
        error.stack,
      );
      return new InternalServerErrorException(
        'Failed to reject friendship - Due To Internal Server Error',
      );
    }
  }

  // Remove Friendship
  async removeFriendship(id: string, req_user: IUser) {
    try {
      const { data: friendship } = (await this.supabase
        .getClient()
        .from('friendships')
        .select(
          '*, requester_id!inner(id, first_name, last_name, username), requestee_id!inner(id, first_name, last_name, username)',
        )
        .or(
          `and(id.eq.${id},requestee_id.eq.${req_user.id},status.eq.${FriendshipStatus.accepted}), and(id.eq.${id},requester_id.eq.${req_user.id},status.eq.${FriendshipStatus.accepted})`,
        )
        .single()) as { data: IFriendship };

      if (!friendship) {
        return new NotFoundException({
          success: false,
          error: 'Friendship not found',
        });
      }

      await this.supabase.getClient().from('friendships').delete().eq('id', id);

      await this.logger.info(
        `Friendship has been removed: ${JSON.stringify(friendship)}`,
        'friendship',
        `${friendship.requester_id.username} removed a friendship with ${friendship.requestee_id.username}`,
      );

      return {
        success: true,
        message: `${friendship.requester_id.id === req_user.id ? friendship.requestee_id.username : friendship.requester_id.username} removed from your friends list`,
      };
    } catch (error) {
      await this.logger.error(
        error,
        'friendship',
        `There is an error removing friendship`,
        error.stack,
      );
      return new InternalServerErrorException(
        'Failed to remove friendship - Due To Internal Server Error',
      );
    }
  }
}
