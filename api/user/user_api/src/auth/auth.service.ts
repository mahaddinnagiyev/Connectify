import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
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
import { LoggerService } from 'src/logger/logger.service';
import { HttpService } from '@nestjs/axios';
import { Gender } from 'src/enums/gender.enum';

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
    private readonly logger: LoggerService,
    private httpService: HttpService,
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

      await this.logger.debug(
        `Signup attempt: ${JSON.stringify(signupDTO)}`,
        'auth',
      );

      const isUsernameExist = await this.userRepository.findOne({
        where: { username: username },
      });

      if (isUsernameExist) {
        await this.logger.warn(
          `Signup failed - Username already taken: ${username}`,
          'auth',
        );
        return new BadRequestException({
          success: false,
          error: 'This username already taken',
        });
      }

      const checkEmailExist = await this.userRepository.findOne({
        where: { email: email },
      });

      if (checkEmailExist) {
        await this.logger.warn(
          `Signup failed - Email already registered: ${email}`,
          'auth',
        );
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

      await this.logger.info(
        `Signup successful - Verification email sent to: ${signupDTO.email}`,
        'auth',
      );

      return {
        success: true,
        message: 'Confirm code has been sent. Please check your inbox',
      };
    } catch (error) {
      await this.logger.error(
        error.message,
        'auth',
        "There's an error in the signup process",
        error.stack,
      );
      return new InternalServerErrorException(
        'Signup failed - Due to Internal Server Error',
      );
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
        await this.logger.warn(
          'Account confirmation failed - Confirm code not found in session',
          'auth',
        );
        return new BadRequestException({
          success: false,
          error: 'Confirm code not found',
        });
      }

      if (!unconfirmed_user) {
        await this.logger.warn(
          'Account confirmation failed - User not found in session',
          'auth',
        );
        return new BadRequestException({
          success: false,
          error: 'User not found',
        });
      }

      if (code !== confirm_code) {
        await this.logger.warn(
          'Account confirmation failed - Invalid code',
          'auth',
        );
        return new BadRequestException({
          success: false,
          error: 'Invalid code',
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

      await this.logger.info(
        `New user created:\nFull name: ${newUser.first_name} ${newUser.last_name},\nusername: ${newUser.username},\nemail: ${newUser.email}`,
        'auth',
      );

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
      await this.logger.error(
        error.message,
        'auth',
        "There's an error in the account confirmation process",
        error.stack,
      );
      return new InternalServerErrorException(
        'Account confirm failed - Due to Internal Server Error',
      );
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
        await this.logger.warn(
          'Login failed - Invalid credentials(username or email)',
          'auth',
        );
        return new BadRequestException({
          success: false,
          error: 'Invalid credentials',
        });
      }

      const user = check_email_exist ? check_email_exist : check_username_exist;
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        await this.logger.warn(
          'Login failed - Invalid credentials(password)',
          'auth',
        );
        return new BadRequestException({
          success: false,
          message: 'Invalid credentials',
        });
      }

      if (user.is_banned) {
        await this.logger.warn('Login failed - Due to user banned', 'auth');
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
          expiresIn: '5d',
        },
      );

      await this.logger.info(
        `Login successfully:\nFull name: ${user.first_name} ${user.last_name},\nusername: ${user.username},\nemail: ${user.email}`,
        'auth',
      );

      return {
        success: true,
        access_token: access_token,
      };
    } catch (error) {
      await this.logger.error(
        error.message,
        'auth',
        'There is an error in the login process',
        error.stack,
      );
      return new InternalServerErrorException(
        'Login failed - Due to Internal Server Error',
      );
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
      await this.logger.info(
        `User logged out: ${req.user.username}\nToken added to black list: ${token}`,
        'auth',
      );

      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      await this.logger.error(
        error.message,
        'auth',
        'There is an error - in the logout process',
        error.stack,
      );
      return new InternalServerErrorException(
        'Logout failed - Due to Internal Server Error',
      );
    }
  }

  // Google User Authentication
  async validateGoogleUser(user: any): Promise<any> {
    try {
      let existingUser = await this.userRepository.findOne({
        where: {
          email: user.email,
        },
      });

      if (!existingUser) {
        existingUser = this.userRepository.create({
          first_name: user.firstName,
          last_name: user.lastName,
          email: user.email,
          username: this.generateUsername(user.email),
          password: 'signed_up_with_google',
        });

        await this.userRepository.save(existingUser);

        const newAccount = this.accountRepository.create({
          user: existingUser,
          profile_picture: user.profile_picture,
        });

        await this.accountRepository.save(newAccount);
        await this.logger.info(
          `User created successfully:\nFull name: ${existingUser.first_name} ${existingUser.last_name},\nusername: ${existingUser.username},\nemail: ${existingUser.email}`,
          'auth',
        )
      }

      const payload = { id: existingUser.id, username: existingUser.username };
      const access_token = jwt.sign(
        payload,
        process.env.JWT_ACCESS_SECRET_KEY,
        {
          expiresIn: '5d',
        },
      );
      await this.logger.info(
        `Google user authentication successfully:\nFull name: ${existingUser.first_name} ${existingUser.last_name},\nusername: ${existingUser.username},\nemail: ${existingUser.email}`,
        'auth',
      );

      return {
        success: true,
        access_token,
      };
    } catch (error) {
      await this.logger.error(
        error.message,
        'auth',
        'There is an error - in the google user authentication process',
        error.stack,
      );
      return new InternalServerErrorException(
        'Google user authentication failed - Due to Internal Server Error',
      );
    }
  }

  private generateUsername(email: string): string {
    const username = `${email.split('@')[0]}_${uuid().slice(0, 5)}`;
    return username;
  }
}
