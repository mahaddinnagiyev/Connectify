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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  async signup(
    signupDTO: SignupDTO,
  ): Promise<{ success: boolean; message: string; user: any } | HttpException> {
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
          message: 'Username already exist',
        });
      }

      const checkEmailExist = await this.userRepository.findOne({
        where: { email: email },
      });

      if (checkEmailExist) {
        return new BadRequestException({
          success: false,
          message: 'Email already exist',
        });
      }

      if (password !== confirm) {
        return new BadRequestException({
          success: false,
          message: 'Password does not match',
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser: User = this.userRepository.create({
        first_name: first_name,
        last_name: last_name,
        username: username,
        email: email,
        gender: gender,
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
      console.log(error);
      return new InternalServerErrorException();
    }
  }
}
