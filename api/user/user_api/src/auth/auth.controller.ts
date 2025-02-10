import {
  Body,
  Controller,
  Get,
  HttpException,
  Post,
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
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';

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
  ): Promise<{ success: boolean; message: string } | HttpException> {
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
  ): Promise<{ success: boolean; message: string; user: any } | HttpException> {
    return this.authService.confirmAccount(confirmDTO, session);
  }

  // Login
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: { limit: 24, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Post('login')
  async login(
    @Body() body: LoginDTO,
    @Session() session: Record<string, any>,
  ): Promise<{ success: boolean } | HttpException> {
    return await this.authService.login(body, session);
  }

  // Get Token From Session
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: { limit: 100, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Get('session/token')
  async getTokenFromSession(
    @Session() session: Record<string, any>,
  ): Promise<{ access_token: string } | null> {
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
  async logout(
    @Req() req,
  ): Promise<{ success: boolean; message: string } | HttpException> {
    return this.authService.logout(req);
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
