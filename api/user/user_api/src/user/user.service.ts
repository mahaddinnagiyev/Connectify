import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/entities/account.entity';
import { User } from 'src/entities/user.entity';
import { LoggerService } from 'src/logger/logger.service';
import { Repository } from 'typeorm';
import { EditUserInfoDTO } from './dto/user-info-dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private readonly logger: LoggerService,
  ) {}

  async get_user_by_id(
    id: string,
  ): Promise<
    { success: boolean; user: User; account: Account } | HttpException
  > {
    try {
      const user: User = await this.userRepository.findOne({
        where: { id: id },
        select: [
          'id',
          'first_name',
          'last_name',
          'username',
          'email',
          'gender',
          'created_at',
        ],
      });

      const account: Account = await this.accountRepository.findOne({
        where: { user: { id: id } },
      });

      if (!(user && account)) {
        return new NotFoundException({
          success: false,
          error: 'User not found',
        });
      }

      return {
        success: true,
        user,
        account,
      };
    } catch (error) {
      await this.logger.error(
        `Error getting user by id: ${id}\nError: ${error}`,
        'user',
      );
      return new InternalServerErrorException(
        'Finding user by id failed - Due To Internal Server Error',
      );
    }
  }

  async get_user_by_username(
    username: string,
  ): Promise<
    { success: boolean; user: User; account: Account } | HttpException
  > {
    try {
      const user: User = await this.userRepository.findOne({
        where: { username: username },
        select: [
          'id',
          'first_name',
          'last_name',
          'username',
          'email',
          'gender',
          'created_at',
        ],
      });

      const account: Account = await this.accountRepository.findOne({
        where: { user: { id: user.id } },
      });

      if (!(user && account)) {
        return new NotFoundException({
          success: false,
          error: 'User not found',
        });
      }

      return {
        success: true,
        user,
        account,
      };
    } catch (error) {
      await this.logger.error(
        `Error getting user by username: ${username}\nError: ${error}`,
        'user',
      );
      return new InternalServerErrorException(
        'Failed to find user - Due To Internal Server Error',
      );
    }
  }

  async edit_user_informations(
    userDTO: EditUserInfoDTO,
    req_user: User,
  ): Promise<{ success: boolean; message: string } | HttpException> {
    try {
      const { username } = userDTO;

      const userResponse = await this.get_user_by_id(req_user.id);
      if (userResponse instanceof HttpException) {
        return userResponse;
      }
      const user: User = userResponse.user;

      if (username) {
        const usernameResponse = await this.get_user_by_username(username);
        if (
          !(usernameResponse instanceof HttpException) &&
          user.id !== usernameResponse.user.id
        ) {
          await this.logger.warn(
            `Username already taken: ${username}`,
            'user',
            `User: ${req_user.username}`,
          );
          return new BadRequestException({
            success: false,
            error: 'Username already taken',
          });
        }
      }

      await this.userRepository.update(user.id, userDTO);

      await this.logger.info(
        `User informations edited: ${JSON.stringify(userDTO)}`,
        'user',
        `User: ${req_user.username}`,
      );

      return {
        success: true,
        message: 'Informations edited successfully',
      };
    } catch (error) {
      await this.logger.error(
        `Error editing user informations\nError: ${error}`,
        'user',
        `User: ${req_user.username}`,
        error.stack,
      );
      return new InternalServerErrorException(
        'Failed to edit informations - Due To Internal Server Error',
      );
    }
  }
}
