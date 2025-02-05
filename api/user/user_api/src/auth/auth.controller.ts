import {
  Body,
  Controller,
  HttpException,
  Post,
  Req,
  Session,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDTO } from './dto/signup-dto';
import { ConfirmAccountDTO } from './dto/confirm-account-dto';
import { LoginDTO } from './dto/login-dto';
import { JwtAuthGuard } from '../jwt/jwt-auth-guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Signup
  @Post('signup')
  async signup(
    @Body() signupDTO: SignupDTO,
    @Session() session: Record<string, any>,
  ): Promise<{ success: boolean; message: string } | HttpException> {
    return this.authService.signup(signupDTO, session);
  }

  // Confirm Account
  @Post('signup/confirm')
  async confirmAccount(
    @Body() confirmDTO: ConfirmAccountDTO,
    @Session() session: Record<string, any>,
  ): Promise<{ success: boolean; message: string; user: any } | HttpException> {
    return this.authService.confirmAccount(confirmDTO, session);
  }

  // Login
  @Post('login')
  async login(
    @Body() body: LoginDTO,
  ): Promise<{ success: boolean; access_token: string } | HttpException> {
    return await this.authService.login(body);
  }

  // Logout
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req): Promise<{ success: boolean; message: string } | HttpException> {
    return this.authService.logout(req);
  }
}
