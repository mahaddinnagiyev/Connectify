import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  Req,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDTO } from './dto/signup-dto';
import { ConfirmAccountDTO } from './dto/confirm-account-dto';
import { LoginDTO, LoginWithFaceIDDTO } from './dto/login-dto';
import { JwtAuthGuard } from '../jwt/jwt-auth-guard';
import { SkipThrottle, Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import {
  ForgotPasswordDTO,
  SetNewPasswordDTO,
} from './dto/forgot-passsword-dto';
import { Request } from 'express';
import { IUser } from 'src/interfaces/user.interface';
import { RegisterUserFaceIdDTO } from './dto/RegisterUserFaceId-dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Signup
  @Post('signup')
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: { limit: 40, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  async signup(
    @Body() signupDTO: SignupDTO,
    @Session() session: Record<string, any>,
  ) {
    return this.authService.signup(signupDTO, session);
  }

  // Confirm Account
  @Post('signup/confirm')
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: { limit: 40, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  async confirmAccount(
    @Req() req: Request,
    @Body() confirmDTO: ConfirmAccountDTO,
    @Session() session: Record<string, any>,
  ) {
    return this.authService.confirmAccount(confirmDTO, session, req);
  }

  // Login
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: { limit: 24, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Post('login')
  async login(@Body() body: LoginDTO, @Session() session: Record<string, any>) {
    return await this.authService.login(body, session);
  }

  // Get Token From Session
  @SkipThrottle()
  @Get('session/token')
  async getTokenFromSession(@Session() session: Record<string, any>) {
    if (session.access_token) {
      return { access_token: session.access_token };
    }
    return { access_token: 'no_token' };
  }

  // Logout
  @UseGuards(JwtAuthGuard)
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: { limit: 40, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Post('logout')
  async logout(@Req() req: Request, @Session() session: Record<string, any>) {
    return this.authService.logout(req, session);
  }

  // Forgot Password
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: { limit: 40, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDTO: ForgotPasswordDTO) {
    return this.authService.forgotPasssword(forgotPasswordDTO);
  }

  // Reset Password
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: { limit: 40, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Patch('reset-password')
  async resetPassword(
    @Body() setNewPassordDTO: SetNewPasswordDTO,
    @Query('token') token: string,
  ) {
    if (!token) {
      return new BadRequestException({
        success: false,
        message: 'Token is required',
      });
    }

    return this.authService.resetPassword(token, setNewPassordDTO);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: { limit: 120, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Get('check')
  async isTokenValid(@Query('token') token: string) {
    return await this.authService.isResetTokenValid(token);
  }

  // Delete Account
  @UseGuards(JwtAuthGuard)
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: { limit: 40, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Post('delete')
  async deleteAccount(@Req() req: Request) {
    return this.authService.delete_account(req.user as IUser);
  }

  // Confirm Delete Account
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: { limit: 40, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Delete('delete/confirm')
  async confirm_delete_account(
    @Query('token') token: string,
    @Session() session: Record<string, any>,
  ) {
    return this.authService.confirm_delete_account(token, session);
  }

  // Google Login
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Res() res: any,
    @Req() req: any,
    @Session() session: Record<string, any>,
  ) {
    try {
      const userData = req.user;
      if (!userData || !userData.access_token) {
        return res.redirect(
          `${process.env.GOOGLE_CLIENT_REDIRECT_URL}/auth/login/?error=true&condition=1`,
        );
      }

      session.access_token = userData.access_token;
      session.cookie.maxAge = 5 * 24 * 60 * 60 * 1000;
      session.save();

      return res.redirect(
        `${process.env.GOOGLE_CLIENT_REDIRECT_URL}/auth/login?access_token=${userData.access_token}`,
      );
    } catch (error) {
      return res.redirect(
        `${process.env.GOOGLE_CLIENT_REDIRECT_URL}/auth/login/?error=true`,
      );
    }
  }

  // Login With Face ID
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: { limit: 40, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Post('login/faceid')
  async loginFaceID(
    @Body() loginFaceIdDTO: LoginWithFaceIDDTO,
    @Session() session: Record<string, any>,
  ) {
    return this.authService.loginUserFaceID(loginFaceIdDTO, session);
  }

  // Register Face ID
  @UseGuards(JwtAuthGuard)
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: { limit: 40, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Patch('register/faceid')
  async registerUserFaceID(
    @Req() req: Request,
    @Body() registerUserFaceIdDTO: RegisterUserFaceIdDTO,
  ) {
    const { face_descriptor } = registerUserFaceIdDTO;

    return this.authService.registerUserFaceID(
      req.user as IUser,
      face_descriptor,
    );
  }

  // Remove Face ID
  @UseGuards(JwtAuthGuard)
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: { limit: 40, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Patch('remove/faceid')
  async removeUserFaceID(@Req() req: Request) {
    return this.authService.removeUserFaceID(req.user as IUser);
  }
}
