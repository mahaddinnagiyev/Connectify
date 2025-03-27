import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { Request } from 'express';
import { PrivacySettings } from '../enums/privacy-settings.enum';
import { ThrottlerModule } from '@nestjs/throttler';

describe('AccountController', () => {
  let controller: AccountController;
  let service: AccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: AccountService,
          useValue: {
            edit_account: jest.fn(),
            get_social_by_id: jest.fn(),
            add_social_link: jest.fn(),
            edit_social_link: jest.fn(),
            delete_social_link: jest.fn(),
            update_profile_pic: jest.fn(),
            update_privacy_settings: jest.fn(),
          },
        },
      ],
      imports: [
        ThrottlerModule.forRoot({
          errorMessage: 'Too many requests, please try again later.',
          throttlers: [
            {
              limit: 10,
              ttl: 60,
            },
          ],
        }),
      ],
    }).compile();

    controller = module.get<AccountController>(AccountController);
    service = module.get<AccountService>(AccountService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('edit_account', () => {
    it('should edit an account successfully', async () => {
      jest.spyOn(service, 'edit_account').mockResolvedValue({
        success: true,
        message: 'Personal information updated successfully',
      });
      const req = jest.fn(() => ({
        user: { username: 'testuser' },
        get: jest.fn(),
        header: jest.fn(),
      })) as unknown as Request;
      const result = await controller.edit_account({ bio: 'Test' }, req);
      expect(result).toEqual({
        message: 'Personal information updated successfully',
        success: true,
      });
    });
  });

  describe('get_social_by_id', () => {
    it('should return social link by id', async () => {
      jest.spyOn(service, 'get_social_by_id').mockResolvedValue({
        success: true,
        social_link: { id: '1', name: 'GitHub', link: 'https://github.com' },
      });

      const req = jest.fn(() => ({
        user: { username: 'testuser' },
        get: jest.fn(),
        header: jest.fn(),
        params: { id: '1' },
      })) as unknown as Request;
      const result = await controller.get_social_by_id('1', req);
      expect(result).toEqual({
        social_link: { id: '1', name: 'GitHub', link: 'https://github.com' },
        success: true,
      });
    });
  });

  describe('add_social_link', () => {
    it('should add a social link', async () => {
      jest
        .spyOn(service, 'add_social_link')
        .mockResolvedValue({ success: true, message: 'Social link added' });
      const req = jest.fn(() => ({
        user: { username: 'testuser' },
        get: jest.fn(),
        header: jest.fn(),
        params: { id: '1' },
      })) as unknown as Request;
      const result = await controller.add_social_link(
        { name: 'GitHub', link: 'https://github.com' },
        req,
      );
      expect(result).toEqual({
        message: 'Social link added',
        success: true,
      });
    });
  });

  describe('edit_social_link', () => {
    it('should edit a social link successfully', async () => {
      jest.spyOn(service, 'edit_social_link').mockResolvedValue({
        success: true,
        message: 'Social link updated successfully',
      });

      const req = jest.fn(() => ({
        user: { username: 'testuser' },
        get: jest.fn(),
        header: jest.fn(),
        params: { id: '1' },
      })) as unknown as Request;

      const result = await controller.edit_social_link(
        '1',
        { name: 'GitHub', link: 'https://github.com' },
        req,
      );

      expect(result).toEqual({
        success: true,
        message: 'Social link updated successfully',
      });

      expect(service.edit_social_link).toHaveBeenCalledWith(
        { name: 'GitHub', link: 'https://github.com' },
        '1',
        req.user,
      );
    });
  });

  describe('delete_social_link', () => {
    it('should delete a social link', async () => {
      jest
        .spyOn(service, 'delete_social_link')
        .mockResolvedValue({ success: true, message: 'Social link deleted' });

      const req = jest.fn(() => ({
        user: { username: 'testuser' },
        get: jest.fn(),
        header: jest.fn(),
        params: { id: '1' },
      })) as unknown as Request;
      const result = await controller.delete_social_link('1', req);
      expect(result).toEqual({ message: 'Social link deleted', success: true });
    });
  });

  describe('update_profile_pic', () => {
    it('should update profile picture', async () => {
      jest.spyOn(service, 'update_profile_pic').mockResolvedValue({
        success: true,
        message: 'Profile picture updated',
      });

      const req = jest.fn(() => ({
        user: { username: 'testuser' },
        get: jest.fn(),
        header: jest.fn(),
        params: { id: '1' },
      })) as unknown as Request;

      const result = await controller.update_profile_pic(
        req,
        {} as Express.Multer.File,
      );
      expect(result).toEqual({
        message: 'Profile picture updated',
        success: true,
      });
    });
  });

  describe('update_privacy_settings', () => {
    it('should update privacy settings', async () => {
      jest.spyOn(service, 'update_privacy_settings').mockResolvedValue({
        success: true,
        message: 'Privacy settings updated',
      });

      const req = jest.fn(() => ({
        user: { username: 'testuser' },
        get: jest.fn(),
        header: jest.fn(),
        params: { id: '1' },
      })) as unknown as Request;

      const result = await controller.update_privacy_settings(
        { email: PrivacySettings.nobody },
        req,
      );
      expect(result).toEqual({
        message: 'Privacy settings updated',
        success: true,
      });
    });
  });
});
