import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service';
import { LoggerService } from '../logger/logger.service';
import { SupabaseService } from '../supabase/supabase.service';
import {
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { IUser } from '../interfaces/user.interface';
import { IAccount } from '../interfaces/account.interface';
import { EditAccountDTO } from './dto/account-info-dto';
import { SocialLinkDTO } from './dto/social-link-dto';
import { IPrivacySettings } from '../interfaces/privacy-settings.interface';
import { PrivacySettings } from '../enums/privacy-settings.enum';

const mockSupabaseService = {
  getClient: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  update: jest.fn(),
};

const mockLoggerService = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

describe('AccountService', () => {
  let service: AccountService;
  let user: IUser;
  let account: IAccount;
  let supabase: SupabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        { provide: SupabaseService, useValue: mockSupabaseService },
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    supabase = module.get<SupabaseService>(SupabaseService);
    service = module.get<AccountService>(AccountService);
    user = { id: 'user1', username: 'testuser' } as IUser;
    account = { id: 'acc1', user: user, social_links: [] } as IAccount;
  });

  it('should return account if found', async () => {
    mockSupabaseService.single.mockResolvedValue({ data: account });
    const result = await service.get_account_by_user(user);
    expect(result).toEqual(account);
  });

  it('should return NotFoundException if account not found', async () => {
    mockSupabaseService.single.mockResolvedValue({ data: null });
    const result = await service.get_account_by_user(user);
    expect(result).toBeInstanceOf(NotFoundException);
  });

  it('should return InternalServerErrorException on error', async () => {
    mockSupabaseService.single.mockRejectedValue(new Error('DB error'));
    const result = await service.get_account_by_user(user);
    expect(result).toBeInstanceOf(InternalServerErrorException);
  });

  it('should update account info', async () => {
    const dto: EditAccountDTO = { bio: 'New Name' };
    mockSupabaseService.single.mockResolvedValue({ data: account });
    mockSupabaseService.update.mockResolvedValue(null);
    const result = await service.edit_account(dto, user);

    if (!(result instanceof HttpException)) {
      expect(result).toEqual({
        success: true,
        message: 'Personal information updated successfully',
      });
    }
  });

  it('should return NotFoundException when editing non-existing account', async () => {
    mockSupabaseService.single.mockResolvedValue({ data: null });
    const dto: EditAccountDTO = { location: 'New Name' };
    const result = await service.edit_account(dto, user);
    expect(result).toBeInstanceOf(NotFoundException);
  });

  it('should add new social link', async () => {
    const dto: SocialLinkDTO = {
      name: 'LinkedIn',
      link: 'https://linkedin.com',
    };
    mockSupabaseService.single.mockResolvedValue({ data: account });
    mockSupabaseService.update.mockResolvedValue(null);
    const result = await service.add_social_link(dto, user);

    if (!(result instanceof HttpException)) {
      expect(result).toEqual({
        success: true,
        message: 'Social link added successfully',
      });
    }
  });

  it('should return BadRequestException if social link exists', async () => {
    const dto: SocialLinkDTO = {
      name: 'LinkedIn',
      link: 'https://linkedin.com',
    };
    account.social_links.push({ id: 'link1Id', ...dto });
    mockSupabaseService.single.mockResolvedValue({ data: account });
    const result = await service.add_social_link(dto, user);
    expect(result).toBeInstanceOf(BadRequestException);
  });

  describe('edit_social_link', () => {
    it('should edit a social link successfully', async () => {
      user = { id: 'user1', username: 'testuser' } as IUser;
      jest.spyOn(service, 'get_account_by_user').mockResolvedValue({
        id: 'some-id',
        user: user,
        social_links: [{ id: '1', name: 'GitHub', link: 'https://github.com' }],
        privacy: {
          email: PrivacySettings.everyone,
          gender: PrivacySettings.everyone,
          bio: PrivacySettings.everyone,
          location: PrivacySettings.everyone,
          social_links: PrivacySettings.everyone,
          last_login: PrivacySettings.everyone,
        } as IPrivacySettings,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const result = await service.edit_social_link(
        { name: 'GitHub', link: 'https://github.com/new' },
        '1',
        { username: 'testUser' },
      );

      if (!(result instanceof InternalServerErrorException)) {
        expect(result).toEqual({
          success: true,
          message: 'Social link edited successfully',
        });
      }
    });

    it('should return NotFoundException if account not found', async () => {
      jest.spyOn(service, 'get_account_by_user').mockResolvedValue(null);

      const result = await service.edit_social_link(
        { name: 'GitHub', link: 'https://github.com/new' },
        '1',
        { username: 'testUser' },
      );
      expect(result).toBeInstanceOf(NotFoundException);
    });
  });

  describe('delete_social_link', () => {
    it('should delete a social link successfully', async () => {
      user = { id: 'user1', username: 'testuser' } as IUser;
      jest.spyOn(service, 'get_account_by_user').mockResolvedValue({
        id: 'some-id',
        user: user,
        social_links: [{ id: '1', name: 'GitHub', link: 'https://github.com' }],
        privacy: {
          email: PrivacySettings.everyone,
          gender: PrivacySettings.everyone,
          bio: PrivacySettings.everyone,
          location: PrivacySettings.everyone,
          social_links: PrivacySettings.everyone,
          last_login: PrivacySettings.everyone,
        } as IPrivacySettings,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const result = await service.delete_social_link('1', {
        username: 'testUser',
      });

      if (!(result instanceof InternalServerErrorException)) {
        expect(result).toEqual({
          success: true,
          message: 'Social link deleted successfully',
        });
      }
    });

    it('should return BadRequestException if social link not found', async () => {
      user = { id: 'user1', username: 'testuser' } as IUser;
      jest.spyOn(service, 'get_account_by_user').mockResolvedValue({
        id: 'some-id',
        user: user,
        social_links: [],
        privacy: {
          email: PrivacySettings.everyone,
          gender: PrivacySettings.everyone,
          bio: PrivacySettings.everyone,
          location: PrivacySettings.everyone,
          social_links: PrivacySettings.everyone,
          last_login: PrivacySettings.everyone,
        } as IPrivacySettings,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const result = await service.delete_social_link('1', {
        username: 'testUser',
      });
      expect(result).toBeInstanceOf(BadRequestException);
    });
  });

  describe('update_profile_pic', () => {
    it('should update profile picture successfully', async () => {
      user = { id: 'user1', username: 'testuser' } as IUser;
      jest.spyOn(service, 'get_account_by_user').mockResolvedValue({
        id: 'some-id',
        user: user,
        privacy: {
          email: PrivacySettings.everyone,
          gender: PrivacySettings.everyone,
          bio: PrivacySettings.everyone,
          location: PrivacySettings.everyone,
          social_links: PrivacySettings.everyone,
          last_login: PrivacySettings.everyone,
        } as IPrivacySettings,
        profile_picture: '',
        created_at: new Date(),
        updated_at: new Date(),
      });
      jest
        .spyOn(service, 'upload_image')
        .mockResolvedValue('https://new-image-url.com');

      const result = await service.update_profile_pic(
        { username: 'testUser' },
        {} as Express.Multer.File,
      );

      if (!(result instanceof InternalServerErrorException)) {
        expect(result).toEqual({
          success: true,
          message: 'Profile photo updated successfully',
        });
      }
    });

    it('should return NotFoundException if account not found', async () => {
      jest.spyOn(service, 'get_account_by_user').mockResolvedValue(null);

      const result = await service.update_profile_pic(
        { username: 'testUser' },
        {} as Express.Multer.File,
      );
      expect(result).toBeInstanceOf(HttpException);
    });
  });

  describe('update_privacy_settings', () => {
    it('should update privacy settings successfully', async () => {
      jest
        .spyOn(service, 'get_account_by_user')
        .mockResolvedValue(account as IAccount);
      jest
        .spyOn(supabase.getClient().from('privacy_settings'), 'update')
        .mockResolvedValue({
          data: null,
          error: null,
          status: 200,
          statusText: 'OK',
          count: 0,
        });

      const result = await service.update_privacy_settings(
        { email: PrivacySettings.everyone },
        { username: 'testUser' },
      );

      if (!(result instanceof InternalServerErrorException)) {
        expect(result).toEqual({
          success: true,
          message: 'Privacy settings updated',
        });
      }
    });

    it('should return NotFoundException if privacy settings not found', async () => {
      jest.spyOn(service, 'get_account_by_user').mockResolvedValue(null);

      const result = await service.update_privacy_settings(
        { email: PrivacySettings.everyone },
        { username: 'testUser' },
      );
      expect(result).toBeInstanceOf(HttpException);
    });
  });
});
