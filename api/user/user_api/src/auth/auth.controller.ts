import {
  Body,
  Controller,
  HttpException,
  InternalServerErrorException,
  Post,
  Req,
  Session,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDTO } from './dto/signup-dto';
import { ConfirmAccountDTO } from './dto/confirm-account-dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body() signupDTO: SignupDTO,
    @Session() session: Record<string, any>,
  ): Promise<{ success: boolean; message: string } | HttpException> {
    try {
      return this.authService.signup(signupDTO, session);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  @Post('signup/confirm')
  async confirmAccount(
    @Body() confirmDTO: ConfirmAccountDTO,
    @Session() session: Record<string, any>,
  ): Promise<{ success: boolean; message: string; user: any } | HttpException> {
    try {
      return this.authService.confirmAccount(confirmDTO, session);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
}
