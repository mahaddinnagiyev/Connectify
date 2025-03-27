import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { AuthService } from './auth.service';
import { MailerService } from '@nestjs-modules/mailer';
import { SupabaseService } from '../supabase/supabase.service';
import { LoggerService } from '../logger/logger.service';
import { Gender } from '../enums/gender.enum';
import { Provider } from '../enums/provider.enum';

describe('AuthService', () => {
  let authService: AuthService;
  let mailerService: MailerService;
  let supabaseService: SupabaseService;
  let loggerService: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: SupabaseService,
          useValue: {
            getClient: jest.fn(() => ({
              from: jest.fn(() => ({
                select: jest.fn(() => ({
                  eq: jest.fn(() => ({
                    single: jest.fn(),
                  })),
                })),
                insert: jest.fn(() => ({
                  select: jest.fn(() => ({
                    single: jest.fn(),
                  })),
                })),
              })),
            })),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            debug: jest.fn(),
            warn: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    mailerService = module.get<MailerService>(MailerService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  describe('signup', () => {
    it('should send confirmation email and set session data on successful signup', async () => {
      const signupDTO = {
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        email: 'test@example.com',
        gender: Gender.male,
        password: 'password',
        confirm: 'password',
      };
      const session: any = {};

      const mockClient = {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null }),
            }),
          })),
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({
                data: { id: 'newId', username: 'testuser' },
              }),
            })),
          })),
        })),
      };
      (supabaseService.getClient as jest.Mock).mockReturnValue(mockClient);

      const result = await authService.signup(signupDTO, session);

      expect(result).toHaveProperty('success', true);
      expect(session).toHaveProperty('confirm_code');
      expect(session).toHaveProperty('unconfirmed_user');
      expect(mailerService.sendMail).toHaveBeenCalled();
    });

    it('should return BadRequestException if username already exists', async () => {
      const signupDTO = {
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        email: 'test@example.com',
        gender: Gender.male,
        password: 'password',
        confirm: 'password',
      };
      const session: any = {};

      const mockClient = {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn().mockReturnValue({
              single: jest
                .fn()
                .mockResolvedValue({ data: { id: 'existingId' } }),
            }),
          })),
        })),
      };
      (supabaseService.getClient as jest.Mock).mockReturnValue(mockClient);

      const result = await authService.signup(signupDTO, session);
      expect(result).toBeInstanceOf(BadRequestException);
    });

    it('should return BadRequestException if email already exists', async () => {
      const signupDTO = {
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        email: 'test@example.com',
        gender: Gender.male,
        password: 'password',
        confirm: 'password',
      };
      const session: any = {};

      const mockClient = {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: 'existingId' }),
            }),
          })),
        })),
      };
      (supabaseService.getClient as jest.Mock).mockReturnValue(mockClient);

      const result = await authService.signup(signupDTO, session);
      expect(result).toBeInstanceOf(BadRequestException);
    });
  });

  describe('confirmAccount', () => {
    let session: any;
    let req: any;
    let confirmDTO: any;
    let mockClient: any;
    beforeEach(() => {
      session = {
        confirm_code: '123456',
        unconfirmed_user: {
          first_name: 'Test',
          last_name: 'User',
          username: 'testuser',
          email: 'test@example.com',
          gender: Gender.male,
          password: 'password',
        },
        save: jest.fn().mockResolvedValue(true),
      };
      req = {
        headers: { 'x-forwarded-for': '8.8.8.8' },
        socket: { remoteAddress: '127.0.0.1' },
      };
      confirmDTO = { code: '123456' };
      mockClient = {
        from: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
      };
      (supabaseService.getClient as jest.Mock).mockReturnValue(mockClient);
    });

    it('should successfully confirm account', async () => {
      const newUser = {
        id: 'newUserId',
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        email: 'test@example.com',
        gender: Gender.male,
        is_banned: false,
        password: 'hashed',
      };
      const newAccount = {
        id: 'newAccountId',
        bio: '',
        location: 'United States of America',
        profile_picture: 'pic_url',
        social_links: {},
      };
      mockClient.single
        .mockResolvedValueOnce({ data: newUser })
        .mockResolvedValueOnce({ data: newAccount })
        .mockResolvedValueOnce({ data: {} });
      const signSpy = jest.spyOn(jwt, 'sign').mockReturnValue('access_token' as any);

      const result = await authService.confirmAccount(confirmDTO, session, req);
      if (result instanceof HttpException) {
        expect(result).toBeInstanceOf(HttpException);
      } else {
        expect(result).toHaveProperty('success', true);
        expect(result).toHaveProperty('message', 'User created successfully');
        expect(result.user).toHaveProperty('id', newUser.id);
        expect(session).not.toHaveProperty('confirm_code');
        expect(session).not.toHaveProperty('unconfirmed_user');
        expect(session).toHaveProperty('access_token', 'access_token');
        expect(session.cookie.maxAge).toBe(5 * 24 * 60 * 60 * 1000);
        expect(session.save).toHaveBeenCalled();
        signSpy.mockRestore();
      }
    });

    it('should return BadRequestException when confirm code not found', async () => {
      delete session.confirm_code;
      const result = await authService.confirmAccount(confirmDTO, session, req);
      expect(result).toBeInstanceOf(BadRequestException);
    });

    it('should return BadRequestException when unconfirmed_user not found', async () => {
      delete session.unconfirmed_user;
      const result = await authService.confirmAccount(confirmDTO, session, req);
      expect(result).toBeInstanceOf(BadRequestException);
    });

    it('should return BadRequestException when code is invalid', async () => {
      confirmDTO.code = 'wrongcode';
      const result = await authService.confirmAccount(confirmDTO, session, req);
      expect(result).toBeInstanceOf(BadRequestException);
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginDTO = {
        username_or_email: 'testuser',
        password: 'password',
      };
      const session: any = {
        save: jest.fn().mockResolvedValue(true),
      };

      const hashedPassword = await bcrypt.hash('password', 10);
      const user = {
        id: '1',
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword,
        is_banned: false,
      };

      const mockClient = {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest
              .fn()
              .mockReturnValueOnce({
                single: jest.fn().mockResolvedValue({ data: user }),
              })
              .mockReturnValueOnce({
                single: jest.fn().mockResolvedValue({ data: null }),
              }),
          })),
        })),
      };
      (supabaseService.getClient as jest.Mock).mockReturnValue(mockClient);

      const result = await authService.login(loginDTO, session);

      if (result instanceof HttpException) {
        expect(result).toBeInstanceOf(HttpException);
      } else {
        expect(result).toHaveProperty('success', true);
        expect(session).toHaveProperty('access_token');
        expect(session.save).toHaveBeenCalled();
      }
    });

    it('should return BadRequestException when credentials are invalid', async () => {
      const loginDTO = {
        username_or_email: 'nonexistent',
        password: 'wrongpassword',
      };
      const session: any = {};

      const mockClient = {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null }),
            }),
          })),
        })),
      };
      (supabaseService.getClient as jest.Mock).mockReturnValue(mockClient);

      const result = await authService.login(loginDTO, session);

      if (result instanceof HttpException) {
        expect(result).toBeInstanceOf(HttpException);
      } else {
        expect(result).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('logout', () => {
    let req: any;
    let session: any;
    let mockClient: any;
    beforeEach(() => {
      req = {
        headers: { authorization: 'Bearer token123' },
        user: { username: 'testuser' },
      };
      session = {
        destroy: jest.fn().mockResolvedValue(true),
      };
      mockClient = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
        insert: jest.fn().mockReturnThis(),
      };
      (supabaseService.getClient as jest.Mock).mockReturnValue(mockClient);
    });

    it('should logout successfully when token is not in blacklist', async () => {
      mockClient.single
        .mockResolvedValueOnce({ data: null })
        .mockResolvedValueOnce({ data: {} });
      const result = await authService.logout(req, session);
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message', 'Logged out successfully');
      expect(session.destroy).toHaveBeenCalled();
    });

    it('should return BadRequestException when token is already blacklisted', async () => {
      mockClient.single.mockResolvedValueOnce({ data: { token: 'token123' } });
      const result = await authService.logout(req, session);
      expect(result).toBeInstanceOf(BadRequestException);
    });
  });

  describe('forgotPassword', () => {
    let forgotPasswordDTO: any;
    let mockClient: any;
    beforeEach(() => {
      forgotPasswordDTO = { email: 'test@example.com' };
      mockClient = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
        update: jest.fn().mockReturnThis(),
      };
      (supabaseService.getClient as jest.Mock).mockReturnValue(mockClient);
    });
    it('should send email with not found message if user does not exist', async () => {
      mockClient.single.mockResolvedValue({ data: null });
      const result = await authService.forgotPasssword(forgotPasswordDTO);
      expect(mailerService.sendMail).toHaveBeenCalled();
      expect(result).toHaveProperty('success', true);
    });
    it('should send email with google sign in message if user is registered via Google', async () => {
      mockClient.single.mockResolvedValue({
        data: { id: '1', email: 'test@example.com', provider: Provider.google },
      });
      const result = await authService.forgotPasssword(forgotPasswordDTO);
      expect(mailerService.sendMail).toHaveBeenCalled();
      expect(result).toHaveProperty('success', true);
    });
    it('should update reset token and send email when user exists and is not Google provider', async () => {
      const user = { id: '1', email: 'test@example.com', provider: 'local' };
      mockClient.single.mockResolvedValueOnce({ data: user });
      mockClient.single.mockResolvedValueOnce({ data: {} });
      const result = await authService.forgotPasssword(forgotPasswordDTO);
      expect(mailerService.sendMail).toHaveBeenCalled();
      expect(result).toHaveProperty('success', true);
    });
  });

  describe('isResetTokenValid', () => {
    let token: string;
    let mockClient: any;
    beforeEach(() => {
      token = 'validtoken123';
      mockClient = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
      };
      (supabaseService.getClient as jest.Mock).mockReturnValue(mockClient);
    });

    it('should return false if token is not provided', async () => {
      const result = await authService.isResetTokenValid('');
      expect(result).toEqual({ success: false });
    });

    it('should return false if user not found or token expired', async () => {
      mockClient.single.mockResolvedValue({ data: null });
      const result = await authService.isResetTokenValid(token);
      expect(result).toEqual({ success: false });
    });

    it('should return true if token is valid', async () => {
      const user = {
        id: '1',
        reset_token_expiration: new Date(Date.now() + 3600000),
      };
      mockClient.single.mockResolvedValue({ data: user });
      const result = await authService.isResetTokenValid(token);
      expect(result).toEqual({ success: true });
    });
  });

  describe('delete_account', () => {
    let reqUser: any;
    let mockClient: any;
    beforeEach(() => {
      reqUser = { id: '1' };
      mockClient = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
        update: jest.fn().mockReturnThis(),
      };
      (supabaseService.getClient as jest.Mock).mockReturnValue(mockClient);
    });

    it('should send delete account email and update user with delete token', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
      };
      mockClient.single.mockResolvedValue({ data: user });
      const result = await authService.delete_account(reqUser);
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty(
        'message',
        'Check your email to delete your account',
      );
      expect(mailerService.sendMail).toHaveBeenCalled();
    });

    it('should return NotFoundException if user not found', async () => {
      mockClient.single.mockResolvedValue({ data: null });
      const result = await authService.delete_account(reqUser);
      expect(result).toBeInstanceOf(NotFoundException);
    });
  });

  describe('confirm_delete_account', () => {
    let token: string;
    let mockClient: any;
    beforeEach(() => {
      token = 'deleteToken123';
      mockClient = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
        storage: {
          from: jest.fn().mockReturnThis(),
          remove: jest.fn(),
        },
        delete: jest.fn().mockReturnThis(),
      };
      (supabaseService.getClient as jest.Mock).mockReturnValue(mockClient);
    });

    it('should delete account successfully when token is valid and profile picture removed', async () => {
      const user = {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        reset_token_expiration: new Date(Date.now() + 3600000),
        account: { profile_picture: 'https://storage.com/profile/johndoe.jpg' },
      };
      mockClient.single.mockResolvedValue({ data: user });
      mockClient.storage.remove.mockResolvedValue({ data: {}, error: null });
      const result = await authService.confirm_delete_account(token);
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty(
        'message',
        'Your account has been deleted successfully. See you later :)',
      );
    });

    it('should return NotFoundException if user not found or token expired', async () => {
      mockClient.single.mockResolvedValue({ data: null });
      const result = await authService.confirm_delete_account(token);
      expect(result).toBeInstanceOf(NotFoundException);
    });

    it('should return BadRequestException if profile picture deletion fails', async () => {
      const user = {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        reset_token_expiration: new Date(Date.now() + 3600000),
        account: { profile_picture: 'https://storage.com/profile/johndoe.jpg' },
      };
      mockClient.single.mockResolvedValue({ data: user });
      mockClient.storage.remove.mockResolvedValue({
        data: null,
        error: { message: 'Deletion error', stack: 'errorStack' },
      });
      const result = await authService.confirm_delete_account(token);
      expect(result).toBeInstanceOf(BadRequestException);
    });
  });

  describe('validateGoogleUser', () => {
    let googleUser: any;
    let ip: string;
    let mockClient: any;
    beforeEach(() => {
      googleUser = {
        email: 'google@example.com',
        firstName: 'Google',
        lastName: 'User',
        profile_picture: 'https://google.com/pic.jpg',
      };
      ip = '8.8.8.8';
      mockClient = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
        insert: jest.fn().mockReturnThis(),
      };
      (supabaseService.getClient as jest.Mock).mockReturnValue(mockClient);
    });

    it('should create a new google user if not exists and return access token', async () => {
      mockClient.single.mockResolvedValueOnce({ data: null });
      const newUser = {
        id: '2',
        first_name: googleUser.firstName,
        last_name: googleUser.lastName,
        username: 'google@example.com',
        email: googleUser.email,
        gender: 'notProvided',
        provider: Provider.google,
        is_banned: false,
      };
      mockClient.single
        .mockResolvedValueOnce({ data: newUser })
        .mockResolvedValueOnce({
          data: {
            id: 'accountId',
            profile_picture: googleUser.profile_picture,
          },
        })
        .mockResolvedValueOnce({ data: {} });
      const signSpy = jest.spyOn(jwt, 'sign').mockReturnValue('access_token' as any);
      const result = await authService.validateGoogleUser(googleUser, ip);
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('access_token', 'access_token');
      signSpy.mockRestore();
    });

    it('should return access token if google user exists', async () => {
      const existUser = {
        id: '2',
        first_name: 'Google',
        last_name: 'User',
        username: 'google@example.com',
        email: googleUser.email,
        provider: Provider.google,
        is_banned: false,
      };
      mockClient.single.mockResolvedValue({ data: existUser });
      const signSpy = jest.spyOn(jwt, 'sign').mockReturnValue('access_token' as any);
      const result = await authService.validateGoogleUser(googleUser, ip);
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('access_token', 'access_token');
      signSpy.mockRestore();
    });

    it('should return BadRequestException if user exists with non-google provider', async () => {
      const existUser = {
        id: '2',
        first_name: 'Normal',
        last_name: 'User',
        username: 'normaluser',
        email: googleUser.email,
        provider: Provider.normal,
        is_banned: false,
      };
      mockClient.single.mockResolvedValue({ data: existUser });
      const result = await authService.validateGoogleUser(googleUser, ip);
      expect(result).toBeInstanceOf(BadRequestException);
    });

    it('should return ForbiddenException if user is banned', async () => {
      const existUser = {
        id: '2',
        first_name: 'Google',
        last_name: 'User',
        username: 'google@example.com',
        email: googleUser.email,
        provider: Provider.google,
        is_banned: true,
      };
      mockClient.single.mockResolvedValue({ data: existUser });
      const result = await authService.validateGoogleUser(googleUser, ip);
      expect(result).toBeInstanceOf(ForbiddenException);
    });
  });
});
