import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/entities/user.entity';
import { SignupDTO } from './dto/signup-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from 'src/entities/account.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { signup_confirm_message } from './utils/messages/signup-confirm';
import { generate_confirm_code } from './utils/generate-codes';
import { ConfirmAccountDTO } from './dto/confirm-account-dto';
import { LoginDTO } from './dto/login-dto';
import { JwtPayload } from '../jwt/jwt-payload';
import { TokenBlackList } from 'src/entities/token-black-list.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(TokenBlackList)
    private tokenBlackListRepository: Repository<TokenBlackList>,
    private readonly mailService: MailerService,
  ) {}

  // Signup
  async signup(
    signupDTO: SignupDTO,
    session: Record<string, any>,
  ): Promise<{ success: boolean; message: string } | HttpException> {
    try {
      const {
        first_name,
        last_name,
        username,
        email,
        gender,
        password,
        confirm,
      } = signupDTO;

      const isUsernameExist = await this.userRepository.findOne({
        where: { username: username },
      });

      if (isUsernameExist) {
        return new BadRequestException({
          success: false,
          error: 'This username already taken',
        });
      }

      const checkEmailExist = await this.userRepository.findOne({
        where: { email: email },
      });

      if (checkEmailExist) {
        return new BadRequestException({
          success: false,
          error: 'This email already registered',
        });
      }

      if (password !== confirm) {
        return new BadRequestException({
          success: false,
          error: 'Password does not match',
        });
      }

      const confirm_code = generate_confirm_code();

      await this.mailService.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Confirm your email',
        text: signup_confirm_message(first_name, last_name, confirm_code),
      });

      session.confirm_code = confirm_code;
      session.unconfirmed_user = {
        first_name: first_name,
        last_name: last_name,
        username: username,
        email: email,
        gender: gender,
        password: password,
      };

      return {
        success: true,
        message: 'Confirm code has been sent. Please check your inbox',
      };
    } catch (error) {
      console.log(error);
      return new InternalServerErrorException();
    }
  }

  // Confirm Account
  async confirmAccount(
    confirmDTO: ConfirmAccountDTO,
    session: Record<string, any>,
  ): Promise<{ success: boolean; message: string; user: any } | HttpException> {
    try {
      const { code } = confirmDTO;
      const confirm_code = session.confirm_code;
      const unconfirmed_user = session.unconfirmed_user;

      if (!confirm_code) {
        return new BadRequestException({
          success: false,
          error: 'Confirm code not found',
        });
      }

      if (!unconfirmed_user) {
        return new BadRequestException({
          success: false,
          error: 'User not found',
        });
      }

      if (code !== confirm_code) {
        return new BadRequestException({
          success: false,
          error: 'Invalid code',
        });
      }

      if (!session.unconfirmed_user) {
        return new BadRequestException({
          success: false,
          error: 'User not found',
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(unconfirmed_user.password, salt);

      const newUser: User = this.userRepository.create({
        first_name: unconfirmed_user.first_name,
        last_name: unconfirmed_user.last_name,
        username: unconfirmed_user.username,
        email: unconfirmed_user.email,
        gender: unconfirmed_user.gender,
        password: hashedPassword,
      });

      await this.userRepository.save(newUser);

      const newAccount: Account = this.accountRepository.create({
        user: newUser,
      });

      await this.accountRepository.save(newAccount);

      delete session.unconfirmed_user;
      delete session.confirm_code;

      return {
        success: true,
        message: 'User created successfully',
        user: {
          id: newUser.id,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          username: newUser.username,
          email: newUser.email,
          gender: newUser.gender,
          is_admin: newUser.is_admin,
          account: {
            id: newAccount.id,
            bio: newAccount.bio,
            location: newAccount.location,
            profile_picture: newAccount.profile_picture,
            social_links: newAccount.social_links,
          },
        },
      };
    } catch (error) {
      return new InternalServerErrorException();
    }
  }

  // Login
  async login(
    loginDTO: LoginDTO,
  ): Promise<{ success: boolean; access_token: string } | HttpException> {
    try {
      const { username_or_email, password } = loginDTO;

      const check_email_exist = await this.userRepository.findOne({
        where: { email: username_or_email },
      });

      const check_username_exist = await this.userRepository.findOne({
        where: { username: username_or_email },
      });

      if (!check_email_exist && !check_username_exist) {
        return new BadRequestException({
          success: false,
          error: 'Invalid credentials',
        });
      }

      const user = check_email_exist ? check_email_exist : check_username_exist;
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return new BadRequestException({
          success: false,
          message: 'Invalid credentials',
        });
      }

      if (user.is_banned) {
        return new ForbiddenException({
          success: false,
          message: 'Your account has been banned',
        });
      }

      const payload: JwtPayload = {
        id: user.id,
        username: user.username,
      };

      const access_token = jwt.sign(
        payload,
        process.env.JWT_ACCESS_SECRET_KEY,
        {
          expiresIn: '30m',
        },
      );

      return {
        success: true,
        access_token: access_token,
      };
    } catch (error) {
      console.log(error);
      return new InternalServerErrorException();
    }
  }

  // Logout
  async logout(
    req: any,
  ): Promise<{ success: boolean; message: string } | HttpException> {
    try {

      const token = req.headers.authorization?.split(' ')[1];
      
      const isTokenInBlackList = await this.tokenBlackListRepository.findOne({
        where: { token: token },
      });

      if (isTokenInBlackList) {
        return new BadRequestException({
          success: false,
          message: 'Token is invalid or expired',
        });
      }

      const blackListToken = this.tokenBlackListRepository.create({
        token: token,
      });

      await this.tokenBlackListRepository.save(blackListToken);

      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      console.log(error);
      return new InternalServerErrorException();
    }
  }
}
