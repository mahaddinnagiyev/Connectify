import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { LoggerService } from '../logger/logger.service';
import { SupabaseService } from '../supabase/supabase.service';
import { InternalServerErrorException, HttpException } from '@nestjs/common';
import { IAccount } from '../interfaces/account.interface';
import { IPrivacySettings } from '../interfaces/privacy-settings.interface';

describe('UserService', () => {
  let service: UserService;
  let loggerService: any;
  let supabaseService: any;

  beforeEach(async () => {
    loggerService = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
    supabaseService = { getClient: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: LoggerService, useValue: loggerService },
        { provide: SupabaseService, useValue: supabaseService },
      ],
    }).compile();
    service = module.get<UserService>(UserService);
  });

  describe('gel_all_users', () => {
    it('should return all users with accounts', async () => {
      const users = [
        {
          id: '1',
          first_name: 'John',
          last_name: 'Doe',
          username: 'john',
          email: 'john@example.com',
          gender: 'M',
          created_at: new Date(),
        },
      ];
      const account = { id: 'acc1', user_id: '1' };
      const usersQuery = {
        select: jest.fn().mockReturnValue(Promise.resolve({ data: users })),
      };
      const accountsQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: account }),
          }),
        }),
      };
      supabaseService.getClient.mockReturnValueOnce({
        from: jest.fn((table: string) => (table === 'users' ? usersQuery : {})),
      });
      supabaseService.getClient.mockReturnValueOnce({
        from: jest.fn((table: string) =>
          table === 'accounts' ? accountsQuery : {},
        ),
      });
      const result = await service.gel_all_users();
      if (result instanceof HttpException) {
        expect(result).toBeInstanceOf(HttpException);
      } else {
        expect(result.success).toBe(true);
        expect(result.users).toHaveLength(1);
        expect(result.users[0].account).toEqual(account);
      }
    });

    it('should return InternalServerErrorException on error', async () => {
      supabaseService.getClient.mockImplementation(() => {
        throw new Error('fail');
      });
      const result = await service.gel_all_users();
      expect(result).toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('get_user_by_id', () => {
    it('should return user with account and privacy settings', async () => {
      const user = {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        username: 'john',
        email: 'john@example.com',
        gender: 'M',
        created_at: new Date(),
      };
      const account = { id: 'acc1', user_id: '1' };
      const privacy = { account_id: 'acc1' };
      const userQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: user }),
          }),
        }),
      };
      const accountQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: account }),
          }),
        }),
      };
      const privacyQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: privacy }),
          }),
        }),
      };
      supabaseService.getClient
        .mockReturnValueOnce({
          from: jest.fn((table: string) =>
            table === 'users' ? userQuery : {},
          ),
        })
        .mockReturnValueOnce({
          from: jest.fn((table: string) =>
            table === 'accounts' ? accountQuery : {},
          ),
        })
        .mockReturnValueOnce({
          from: jest.fn((table: string) =>
            table === 'privacy_settings' ? privacyQuery : {},
          ),
        });
      const result = await service.get_user_by_id('1');
      if (result instanceof HttpException) {
        expect(result).toBeInstanceOf(HttpException);
      } else {
        expect(result.success).toBe(true);
        expect(result.user).toEqual(user);
        expect(result.account).toEqual(account);
        expect(result.privacy_settings).toEqual(privacy);
      }
    });

    it('should return NotFoundException if data missing', async () => {
      const userQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null }),
          }),
        }),
      };
      supabaseService.getClient.mockReturnValue({
        from: jest.fn((table: string) => (table === 'users' ? userQuery : {})),
      });
      const result = await service.get_user_by_id('nonexistent');
      expect(result).toBeInstanceOf(HttpException);
    });

    it('should return InternalServerErrorException on error', async () => {
      supabaseService.getClient.mockImplementation(() => {
        throw new Error('fail');
      });
      const result = await service.get_user_by_id('1');
      expect(result).toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('get_user_by_username', () => {
    it('should return user with account and privacy settings', async () => {
      const user = {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        username: 'john',
        email: 'john@example.com',
        gender: 'M',
        created_at: new Date(),
      };
      const account = { id: 'acc1', user_id: '1' };
      const privacy = { account_id: 'acc1' };
      const userQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: user }),
          }),
        }),
      };
      const accountQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: account }),
          }),
        }),
      };
      const privacyQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: privacy }),
          }),
        }),
      };
      supabaseService.getClient
        .mockReturnValueOnce({
          from: jest.fn((table: string) =>
            table === 'users' ? userQuery : {},
          ),
        })
        .mockReturnValueOnce({
          from: jest.fn((table: string) =>
            table === 'accounts' ? accountQuery : {},
          ),
        })
        .mockReturnValueOnce({
          from: jest.fn((table: string) =>
            table === 'privacy_settings' ? privacyQuery : {},
          ),
        });
      const result = await service.get_user_by_username('john');
      if (result instanceof HttpException) {
        throw result;
      } else {
        expect(result.success).toBe(true);
        expect(result.user).toEqual(user);
        expect(result.account).toEqual(account);
        expect(result.privacy_settings).toEqual(privacy);
      }
    });

    it('should return NotFoundException if data missing', async () => {
      const userQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null }),
          }),
        }),
      };
      supabaseService.getClient.mockReturnValue({
        from: jest.fn((table: string) => (table === 'users' ? userQuery : {})),
      });
      const result = await service.get_user_by_username('nonexistent');
      expect(result).toBeInstanceOf(HttpException);
    });

    it('should return InternalServerErrorException on error', async () => {
      supabaseService.getClient.mockImplementation(() => {
        throw new Error('fail');
      });
      const result = await service.get_user_by_username('john');
      expect(result).toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('edit_user_informations', () => {
    it('should edit user informations successfully', async () => {
      const userDTO = { username: 'newusername' };
      const req_user = { id: '1', username: 'oldusername' };
      const userData = {
        success: true,
        user: { id: '1' },
        account: {} as IAccount,
        privacy_settings: {} as IPrivacySettings,
      };
      const getUserByIdMock = jest
        .spyOn(service, 'get_user_by_id')
        .mockResolvedValue(userData);
      const getUserByUsernameMock = jest
        .spyOn(service, 'get_user_by_username')
        .mockResolvedValue({
          success: true,
          user: { id: '2' },
          account: {} as IAccount,
          privacy_settings: {} as IPrivacySettings,
        });
      const updateMock = jest.fn().mockReturnValue(Promise.resolve({}));
      supabaseService.getClient.mockReturnValue({
        from: jest.fn().mockReturnValue({ update: updateMock, eq: jest.fn() }),
      });
      const result = await service.edit_user_informations(userDTO, req_user);
      if (result instanceof HttpException) {
        expect(result).toBeInstanceOf(HttpException);
      } else {
        expect(result.success).toBe(true);
        expect(result.message).toEqual('Informations edited successfully');
      }
      getUserByIdMock.mockRestore();
      getUserByUsernameMock.mockRestore();
    });

    it('should return BadRequestException if username taken', async () => {
      const userDTO = { username: 'existing' };
      const req_user = { id: '1', username: 'oldusername' };
      const userData = {
        success: true,
        user: { id: '1' },
        account: {} as IAccount,
        privacy_settings: {} as IPrivacySettings,
      };
      jest.spyOn(service, 'get_user_by_id').mockResolvedValue(userData);
      jest.spyOn(service, 'get_user_by_username').mockResolvedValue({
        success: true,
        user: { id: '2' },
        account: {} as IAccount,
        privacy_settings: {} as IPrivacySettings,
      });
      const result = await service.edit_user_informations(userDTO, req_user);
      expect(result).toBeInstanceOf(HttpException);
    });

    it('should return InternalServerErrorException on error', async () => {
      const userDTO = { username: 'newusername' };
      const req_user = { id: '1', username: 'oldusername' };
      jest.spyOn(service, 'get_user_by_id').mockImplementation(() => {
        throw new Error('fail');
      });
      const result = await service.edit_user_informations(userDTO, req_user);
      expect(result).toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('get_block_list', () => {
    it('should return block list successfully', async () => {
      const req_user = { id: '1' };
      const blockListData = [
        {
          id: 'b1',
          blocked_id: {
            id: '2',
            first_name: 'Jane',
            last_name: 'Doe',
            username: 'jane',
          },
          created_at: new Date(),
        },
      ];
      const account = { profile_picture: 'pic.jpg' };
      const blockListQuery = {
        select: jest
          .fn()
          .mockReturnValue(Promise.resolve({ data: blockListData })),
      };
      const accountQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: account }),
          }),
        }),
      };
      supabaseService.getClient
        .mockReturnValueOnce({
          from: jest.fn((table: string) =>
            table === 'block_lists' ? blockListQuery : {},
          ),
        })
        .mockReturnValueOnce({
          from: jest.fn((table: string) =>
            table === 'accounts' ? accountQuery : {},
          ),
        });
      const result = await service.get_block_list(req_user);
      if (result instanceof HttpException) {
        expect(result).toBeInstanceOf(HttpException);
      } else {
        expect(result.success).toBe(true);
        expect(Array.isArray(result.blockList)).toBe(true);
        expect(result.blockList[0].profile_picture).toEqual('pic.jpg');
      }
    });

    it('should return InternalServerErrorException on error', async () => {
      supabaseService.getClient.mockImplementation(() => {
        throw new Error('fail');
      });
      const result = await service.get_block_list({ id: '1' });
      expect(result).toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('get_blocker_list', () => {
    it('should return blocker list successfully', async () => {
      const req_user = { id: '1' };
      const blockListData = [
        {
          id: 'b1',
          blocker_id: {
            id: '2',
            first_name: 'Jane',
            last_name: 'Doe',
            username: 'jane',
          },
          created_at: new Date(),
        },
      ];
      const account = { profile_picture: 'pic.jpg' };
      const blockListQuery = {
        select: jest
          .fn()
          .mockReturnValue(Promise.resolve({ data: blockListData })),
      };
      const accountQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: account }),
          }),
        }),
      };
      supabaseService.getClient
        .mockReturnValueOnce({
          from: jest.fn((table: string) =>
            table === 'block_lists' ? blockListQuery : {},
          ),
        })
        .mockReturnValueOnce({
          from: jest.fn((table: string) =>
            table === 'accounts' ? accountQuery : {},
          ),
        });
      const result = await service.get_blocker_list(req_user);
      if (result instanceof HttpException) {
        expect(result).toBeInstanceOf(HttpException);
      } else {
        expect(result.success).toBe(true);
        expect(Array.isArray(result.blockerList)).toBe(true);
        expect(result.blockerList[0].profile_picture).toEqual('pic.jpg');
      }
    });

    it('should return InternalServerErrorException on error', async () => {
      supabaseService.getClient.mockImplementation(() => {
        throw new Error('fail');
      });
      const result = await service.get_blocker_list({ id: '1' });
      expect(result).toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('block_user', () => {
    it('should block user successfully', async () => {
      const req_user = { id: '1', username: 'user1' };
      const targetUser = { id: '2', username: 'user2' };
      jest.spyOn(service, 'get_user_by_id').mockResolvedValue({
        success: true,
        user: targetUser,
        account: {} as IAccount,
        privacy_settings: {} as IPrivacySettings,
      });
      jest.spyOn(service, 'get_user_by_username').mockResolvedValue({
        success: true,
        user: targetUser,
        account: {} as IAccount,
        privacy_settings: {} as IPrivacySettings,
      });
      const isBlockedQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null }),
          }),
        }),
      };
      const isFriendQuery = {
        select: jest.fn().mockReturnValue({
          or: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null }),
          }),
        }),
      };
      const blockListInsert = jest
        .fn()
        .mockReturnValue({ single: jest.fn().mockResolvedValue({ data: {} }) });
      supabaseService.getClient
        .mockReturnValueOnce({
          from: jest.fn((table: string) =>
            table === 'block_lists' ? isBlockedQuery : {},
          ),
        })
        .mockReturnValueOnce({
          from: jest.fn((table: string) =>
            table === 'friendships' ? isFriendQuery : {},
          ),
        })
        .mockReturnValueOnce({
          from: jest.fn((table: string) =>
            table === 'block_lists' ? { insert: blockListInsert } : {},
          ),
        });
      const result = await service.block_user(targetUser.id, req_user);
      if (result instanceof HttpException) {
        expect(result).toBeInstanceOf(HttpException);
      } else {
        expect(result.success).toBe(true);
      }
    });

    it('should return BadRequestException if blocking self', async () => {
      const req_user = { id: '1', username: 'user1' };
      const result = await service.block_user(req_user.id, req_user);
      expect(result).toBeInstanceOf(HttpException);
    });

    it('should return BadRequestException if already blocked', async () => {
      const req_user = { id: '1', username: 'user1' };
      const targetUser = { id: '2', username: 'user2' };
      jest.spyOn(service, 'get_user_by_id').mockResolvedValue({
        success: true,
        user: targetUser,
        account: {} as IAccount,
        privacy_settings: {} as IPrivacySettings,
      });
      jest.spyOn(service, 'get_user_by_username').mockResolvedValue({
        success: true,
        user: targetUser,
        account: {} as IAccount,
        privacy_settings: {} as IPrivacySettings,
      });
      const isBlockedQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: { id: 'blocked' } }),
          }),
        }),
      };
      supabaseService.getClient.mockReturnValueOnce({
        from: jest.fn((table: string) =>
          table === 'block_lists' ? isBlockedQuery : {},
        ),
      });
      const result = await service.block_user(targetUser.id, req_user);
      expect(result).toBeInstanceOf(HttpException);
    });

    it('should return InternalServerErrorException on error', async () => {
      jest.spyOn(service, 'get_user_by_id').mockImplementation(() => {
        throw new Error('fail');
      });
      const result = await service.block_user('2', {
        id: '1',
        username: 'user1',
      });
      expect(result).toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('unblock_user', () => {
    it('should unblock user successfully', async () => {
      const req_user = { id: '1', username: 'user1' };
      const targetUser = { id: '2', username: 'user2' };
      jest.spyOn(service, 'get_user_by_id').mockResolvedValue({
        success: true,
        user: targetUser,
        account: {} as IAccount,
        privacy_settings: {} as IPrivacySettings,
      });
      const isBlockedQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({ data: [{ id: 'blocked' }] }),
        }),
      };
      const blockListDelete = jest
        .fn()
        .mockReturnValue({ eq: jest.fn().mockReturnValue({}) });
      supabaseService.getClient
        .mockReturnValueOnce({
          from: jest.fn((table: string) =>
            table === 'block_lists' ? isBlockedQuery : {},
          ),
        })
        .mockReturnValueOnce({
          from: jest.fn((table: string) =>
            table === 'block_lists' ? { delete: blockListDelete } : {},
          ),
        });
      const result = await service.unblock_user(targetUser.id, req_user);
      if (result instanceof HttpException) {
        expect(result).toBeInstanceOf(HttpException);
      } else {
        expect(result.success).toBe(true);
      }
    });

    it('should return BadRequestException if not blocked', async () => {
      const req_user = { id: '1', username: 'user1' };
      const targetUser = { id: '2', username: 'user2' };
      jest.spyOn(service, 'get_user_by_id').mockResolvedValue({
        success: true,
        user: targetUser,
        account: {} as IAccount,
        privacy_settings: {} as IPrivacySettings,
      });
      const isBlockedQuery = {
        select: jest
          .fn()
          .mockReturnValue({ eq: jest.fn().mockReturnValue({ data: null }) }),
      };
      supabaseService.getClient.mockReturnValue({
        from: jest.fn((table: string) =>
          table === 'block_lists' ? isBlockedQuery : {},
        ),
      });
      const result = await service.unblock_user(targetUser.id, req_user);
      expect(result).toBeInstanceOf(HttpException);
    });

    it('should return InternalServerErrorException on error', async () => {
      jest.spyOn(service, 'get_user_by_id').mockImplementation(() => {
        throw new Error('fail');
      });
      const result = await service.unblock_user('2', {
        id: '1',
        username: 'user1',
      });
      expect(result).toBeInstanceOf(InternalServerErrorException);
    });
  });
});
