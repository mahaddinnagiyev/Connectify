import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Friendship } from 'src/entities/friendship.entity';
import { LoggerService } from 'src/logger/logger.service';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { FriendshipStatus } from 'src/enums/friendship-status';
import { BlockList } from 'src/entities/blocklist.entity';
import { Account } from 'src/entities/account.entity';

@Injectable()
export class FriendshipService {
  constructor(
    @InjectRepository(Friendship)
    private friendshipRepository: Repository<Friendship>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(BlockList)
    private blockListRepository: Repository<BlockList>,
    private readonly logger: LoggerService,
  ) {}

  // Get User Friends
  async getFriends(req_user: User) {
    try {
      const friendships = await this.friendshipRepository.find({
        where: [
          { requester: { id: req_user.id }, status: FriendshipStatus.accepted },
          { requestee: { id: req_user.id }, status: FriendshipStatus.accepted },
        ],
        relations: ['requester', 'requestee'],
        select: [
          'id',
          'status',
          'requester',
          'requestee',
          'created_at',
          'updated_at',
        ],
      });

      const mappedFriends = [];

      for (const friendship of friendships) {
        const friendUser =
          friendship.requester.id === req_user.id
            ? friendship.requestee
            : friendship.requester;

        const account = await this.accountRepository.findOne({
          where: { user: { id: friendUser.id } },
        });

        const friend = {
          id: friendship.id,
          friend_id: friendUser.id,
          first_name: friendUser.first_name,
          last_name: friendUser.last_name,
          username: friendUser.username,
          profile_picture: account.profile_picture ? account.profile_picture : null,
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
  async getFriendshipRequests(req_user: User) {
    try {
      const friendRequests = await this.friendshipRepository.find({
        where: [
          { requester: { id: req_user.id }, status: FriendshipStatus.pending },
          { requestee: { id: req_user.id }, status: FriendshipStatus.pending },
        ],
        relations: ['requester', 'requestee'],
      });

      if (!friendRequests) {
        return new NotFoundException({
          success: false,
          error: 'Friendship requests not found',
        });
      }

      let sentRequest: Friendship[] = [];
      let receivedRequest: Friendship[] = [];

      friendRequests.forEach((friendship) => {
        if (friendship.requester.id === req_user.id) {
          sentRequest.push(friendship);
        } else if (friendship.requestee.id === req_user.id) {
          receivedRequest.push(friendship);
        }
      });

      const mappedSentRequest = sentRequest.map(async (friendship) => {
        const account = await this.accountRepository.findOne({
          where: { user: { id: friendship.requestee.id } },
        })

        return {
          id: friendship.id,
          requester: {
            id: friendship.requester.id,
            first_name: friendship.requester.first_name,
            last_name: friendship.requester.last_name,
            username: friendship.requester.username,
          },
          requestee: {
            id: friendship.requestee.id,
            first_name: friendship.requestee.first_name,
            last_name: friendship.requestee.last_name,
            username: friendship.requestee.username,
            profile_picture: account.profile_picture ? account.profile_picture : null
          },
          status: friendship.status,
          created_at: friendship.created_at,
          updated_at: friendship.updated_at,
        };
      });
      const mappedRevievedRequest = receivedRequest.map(async (friendship) => {
        const account = await this.accountRepository.findOne({
          where: { user: { id: friendship.requester.id } },
        })

        return {
          id: friendship.id,
          requester: {
            id: friendship.requester.id,
            first_name: friendship.requester.first_name,
            last_name: friendship.requester.last_name,
            username: friendship.requester.username,
            profile_picture: account.profile_picture ? account.profile_picture : null
          },
          requestee: {
            id: friendship.requestee.id,
            first_name: friendship.requestee.first_name,
            last_name: friendship.requestee.last_name,
            username: friendship.requestee.username,
          },
          status: friendship.status,
          created_at: friendship.created_at,
          updated_at: friendship.updated_at,
        };
      });

      await this.logger.info(
        `Friendship requests has been fetched: ${JSON.stringify(friendRequests)}`,
        'friendship',
        `User: ${req_user.username}`,
      );

      return {
        success: true,
        sentRequests: mappedSentRequest,
        receivedRequests: mappedRevievedRequest,
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
  async createFriendship(requestee: string, req_user: User) {
    try {
      if (req_user.id === requestee) {
        return new BadRequestException({
          success: false,
          error: 'You cannot send a friendship request to yourself',
        });
      }

      const isRequesteeBlocked = await this.blockListRepository.findOne({
        where: {
          blocker: { id: req_user.id },
          blocked: { id: requestee },
        },
      });

      const isRequesterBlocked = await this.blockListRepository.findOne({
        where: {
          blocker: { id: requestee },
          blocked: { id: req_user.id },
        },
      });

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

      const requesteeUser = await this.userRepository.findOne({
        where: { id: requestee },
      });

      if (!requesteeUser) {
        throw new NotFoundException('Requestee user not found');
      }

      const isFriendshipExists = await this.friendshipRepository.findOne({
        where: [
          { requester: { id: req_user.id }, requestee: { id: requestee } },
          { requester: { id: requestee }, requestee: { id: req_user.id } },
        ],
      });

      if (isFriendshipExists) {
        return new BadRequestException({
          success: false,
          error: 'Friendship already exists',
        });
      }

      const newFriendship = this.friendshipRepository.create({
        requester: req_user,
        requestee: requesteeUser,
      });

      await this.friendshipRepository.save(newFriendship);

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
  async acceptFriendship(id: string, req_user: User) {
    try {
      const friendship = await this.friendshipRepository.findOne({
        where: [{ id: id, requestee: { id: req_user.id } }],
        relations: ['requester', 'requestee'],
      });

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

      await this.friendshipRepository.update(id, {
        status: FriendshipStatus.accepted,
      });

      await this.logger.info(
        `Friendship has been accepted: ${JSON.stringify(friendship)}`,
        'friendship',
        `${friendship.requestee.username} accepted a friendship request from ${friendship.requester.username}`,
      );

      return {
        success: true,
        message: 'Friendship request accepted',
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
  async rejectFriendship(id: string, req_user: User) {
    try {
      const friendship = await this.friendshipRepository.findOne({
        where: [{ id: id, requestee: { id: req_user.id } }],
        relations: ['requester', 'requestee'],
      });

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

      await this.friendshipRepository.remove(friendship);

      await this.logger.info(
        `Friendship has been rejected: ${JSON.stringify(friendship)}`,
        'friendship',
        `${friendship.requestee.username} rejected a friendship request from ${friendship.requester.username}`,
      );

      return {
        success: true,
        message: 'Friendship request rejected',
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
}
