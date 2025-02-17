import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
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
import { LoginDTO } from './dto/login-dto';
import { JwtAuthGuard } from '../jwt/jwt-auth-guard';
import { SkipThrottle, Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import {
  ForgotPasswordDTO,
  SetNewPasswordDTO,
} from './dto/forgot-passsword-dto';

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
    @Body() confirmDTO: ConfirmAccountDTO,
    @Session() session: Record<string, any>,
  ) {
    return this.authService.confirmAccount(confirmDTO, session);
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
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: { limit: 100, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Get('session/token')
  async getTokenFromSession(@Session() session: Record<string, any>) {
    if (session.access_token) {
      return { access_token: session.access_token };
    }
    return null;
  }

  // Logout
  @UseGuards(JwtAuthGuard)
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: { limit: 40, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Post('logout')
  async logout(@Req() req) {
    return this.authService.logout(req);
  }

  // Forgot Password\
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
  @SkipThrottle()
  @Get('check')
  async isTokenValid(@Query('token') token: string) {
    return await this.authService.isResetTokenValid(token);
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
          `${process.env.GOOGLE_CLIENT_REDIRECT_URL}/auth/login/?error=true`,
        );
      }

      session.access_token = userData.access_token;
      session.cookie.maxAge = 5 * 24 * 60 * 60 * 1000;
      session.save();

      return res.redirect(
        `${process.env.GOOGLE_CLIENT_REDIRECT_URL}/auth/login?access_token=${userData.access_token}`,
      );
    } catch (error) {
      console.log(error);
      return res.redirect(
        `${process.env.GOOGLE_CLIENT_REDIRECT_URL}/auth/login/?error=true`,
      );
    }
  }
}
