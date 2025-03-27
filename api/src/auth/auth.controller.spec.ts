import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignupDTO } from './dto/signup-dto';
import { ConfirmAccountDTO } from './dto/confirm-account-dto';
import { LoginDTO } from './dto/login-dto';
import {
  ForgotPasswordDTO,
  SetNewPasswordDTO,
} from './dto/forgot-passsword-dto';
import { Request } from 'express';
import { Gender } from '../enums/gender.enum';
import { ThrottlerModule } from '@nestjs/throttler';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let mockSession: Record<string, any>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signup: jest.fn(),
            confirmAccount: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
            forgotPasssword: jest.fn(),
            resetPassword: jest.fn(),
            isResetTokenValid: jest.fn(),
            delete_account: jest.fn(),
            confirm_delete_account: jest.fn(),
            validateGoogleUser: jest.fn(),
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

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    mockSession = {};
  });

  describe('signup', () => {
    it('should call authService.signup and return its result', async () => {
      const dto: SignupDTO = {
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        email: 'test@example.com',
        gender: Gender.male,
        password: 'password',
        confirm: 'password',
      };
      const result = { success: true };
      (authService.signup as jest.Mock).mockResolvedValue(result);
      expect(await authController.signup(dto, mockSession)).toEqual(result);
      expect(authService.signup).toHaveBeenCalledWith(dto, mockSession);
    });
  });

  describe('confirmAccount', () => {
    it('should call authService.confirmAccount and return its result', async () => {
      const req = { headers: {}, socket: {} } as Request;
      const dto: ConfirmAccountDTO = { code: 123456 };
      const result = { success: true };
      (authService.confirmAccount as jest.Mock).mockResolvedValue(result);
      expect(
        await authController.confirmAccount(req, dto, mockSession),
      ).toEqual(result);
      expect(authService.confirmAccount).toHaveBeenCalledWith(
        dto,
        mockSession,
        req,
      );
    });
  });

  describe('login', () => {
    it('should call authService.login and return its result', async () => {
      const dto: LoginDTO = {
        username_or_email: 'testuser',
        password: 'password',
      };
      const result = { success: true };
      (authService.login as jest.Mock).mockResolvedValue(result);
      expect(await authController.login(dto, mockSession)).toEqual(result);
      expect(authService.login).toHaveBeenCalledWith(dto, mockSession);
    });
  });

  describe('getTokenFromSession', () => {
    it('should return token if session.access_token exists', async () => {
      mockSession.access_token = 'token123';
      expect(await authController.getTokenFromSession(mockSession)).toEqual({
        access_token: 'token123',
      });
    });
    it('should return null if session.access_token does not exist', async () => {
      delete mockSession.access_token;
      expect(await authController.getTokenFromSession(mockSession)).toBeNull();
    });
  });

  describe('logout', () => {
    it('should call authService.logout and return its result', async () => {
      const req = {} as Request;
      const result = { success: true };
      (authService.logout as jest.Mock).mockResolvedValue(result);
      expect(await authController.logout(req, mockSession)).toEqual(result);
      expect(authService.logout).toHaveBeenCalledWith(req, mockSession);
    });
  });

  describe('forgotPassword', () => {
    it('should call authService.forgotPasssword and return its result', async () => {
      const dto: ForgotPasswordDTO = { email: 'test@example.com' };
      const result = { success: true };
      (authService.forgotPasssword as jest.Mock).mockResolvedValue(result);
      expect(await authController.forgotPassword(dto)).toEqual(result);
      expect(authService.forgotPasssword).toHaveBeenCalledWith(dto);
    });
  });

  describe('resetPassword', () => {
    it('should call authService.resetPassword and return its result when token is provided', async () => {
      const dto: SetNewPasswordDTO = { password: 'newpassword' };
      const token = 'resettoken';
      const result = { success: true };
      (authService.resetPassword as jest.Mock).mockResolvedValue(result);
      expect(await authController.resetPassword(dto, token)).toEqual(result);
      expect(authService.resetPassword).toHaveBeenCalledWith(token, dto);
    });
    it('should return BadRequestException if token is not provided', async () => {
      const dto: SetNewPasswordDTO = { password: 'newpassword' };
      expect(await authController.resetPassword(dto, '')).toEqual(
        new BadRequestException({
          success: false,
          message: 'Token is required',
        }),
      );
    });
  });

  describe('isTokenValid', () => {
    it('should call authService.isResetTokenValid and return its result', async () => {
      const token = 'token123';
      const result = { success: true };
      (authService.isResetTokenValid as jest.Mock).mockResolvedValue(result);
      expect(await authController.isTokenValid(token)).toEqual(result);
      expect(authService.isResetTokenValid).toHaveBeenCalledWith(token);
    });
  });

  describe('deleteAccount', () => {
    it('should call authService.delete_account and return its result', async () => {
      const req = jest.fn(() => ({
        user: { id: '1' },
        get: jest.fn(),
        header: jest.fn(),
      })) as unknown as Request;
      const result = { success: true };
      (authService.delete_account as jest.Mock).mockResolvedValue(result);
      expect(await authController.deleteAccount(req)).toEqual(result);
      expect(authService.delete_account).toHaveBeenCalledWith(req.user);
    });
  });

  describe('confirm_delete_account', () => {
    it('should call authService.confirm_delete_account and return its result', async () => {
      const token = 'deleteToken';
      const result = { success: true };
      (authService.confirm_delete_account as jest.Mock).mockResolvedValue(
        result,
      );
      expect(await authController.confirm_delete_account(token)).toEqual(
        result,
      );
      expect(authService.confirm_delete_account).toHaveBeenCalledWith(token);
    });
  });

  describe('googleAuth', () => {
    it('should call googleAuth which does nothing', async () => {
      expect(await authController.googleAuth()).toBeUndefined();
    });
  });

  describe('googleCallback', () => {
    it('should redirect to error if userData is missing or invalid', async () => {
      const req = { user: {} } as any;
      const res = { redirect: jest.fn() } as any;
      const session = { save: jest.fn(), cookie: {} } as any;
      await authController.googleCallback(res, req, session);
      expect(res.redirect).toHaveBeenCalled();
    });
    it('should set session and redirect if userData is valid', async () => {
      const req = { user: { access_token: 'token123' } } as any;
      const res = { redirect: jest.fn() } as any;
      const session = { save: jest.fn(), cookie: {} } as any;
      await authController.googleCallback(res, req, session);
      expect(session.access_token).toEqual('token123');
      expect(session.cookie.maxAge).toBe(5 * 24 * 60 * 60 * 1000);
      expect(session.save).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalled();
    });
  });
});
