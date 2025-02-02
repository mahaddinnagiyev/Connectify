import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { SignupDTO } from './dto/signup-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Account } from 'src/entities/account.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { signup_confirm_message } from './utils/messages/signup-confirm';
import { generate_confirm_code } from './utils/generate-codes';
import { ConfirmAccountDTO } from './dto/confirm-account-dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private readonly mailService: MailerService,
  ) {}

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
          message: 'This username already taken',
        });
      }

      const checkEmailExist = await this.userRepository.findOne({
        where: { email: email },
      });

      if (checkEmailExist) {
        return new BadRequestException({
          success: false,
          message: 'This email already registered',
        });
      }

      if (password !== confirm) {
        return new BadRequestException({
          success: false,
          message: 'Password does not match',
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

  async confirmAccount(
    confirmDTO: ConfirmAccountDTO,
    session: Record<string, any>,
  ): Promise<{ success: boolean; message: string; user: any } | HttpException> {
    try {
      const { code } = confirmDTO;
      const confirm_code = session.confirm_code;

      if (code !== confirm_code) {
        return new BadRequestException({
          success: false,
          message: 'Invalid code',
        });
      }

      const unconfirmed_user = session.unconfirmed_user;

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
}
