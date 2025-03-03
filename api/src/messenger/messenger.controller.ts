import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
  Patch,
  UseInterceptors,
  UploadedFile,
  Query,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { MessengerService } from './messenger.service';
import { Request } from 'express';
import { MessageType } from 'src/enums/message-type.enum';
import { JwtAuthGuard } from 'src/jwt/jwt-auth-guard';
import { IUser } from 'src/interfaces/user.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChatGateway } from './gateway/messenger-gateway';
import { MulterImageConfig } from 'src/supabase/utils/multer-config';
import { UserService } from 'src/user/user.service';

@Controller('messenger')
export class MessengerController {
  constructor(
    private readonly messengerService: MessengerService,
    private readonly userService: UserService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('chat-rooms')
  async getChatRooms(@Req() req: Request) {
    const userId = (req.user as IUser).id;
    return await this.messengerService.getChatRoomsForUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('chat-rooms/:roomId/messages')
  async getMessages(@Param('roomId') roomId: string) {
    return await this.messengerService.getMessagesForRoom(roomId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('chat-rooms/:roomId/messages')
  async sendMessage(
    @Param('roomId') roomId: string,
    @Req() req: Request,
    @Body() body: { content: string; message_type: MessageType },
  ) {
    const senderId = (req.user as IUser).id;
    return await this.messengerService.sendMessage(
      roomId,
      senderId,
      body.content,
      body.message_type,
    );
  }

  // Upload Image
  @Post('upload-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('message_image'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('roomId') roomId: string,
    @Query('senderId') senderId: string,
  ) {
    if (!file) {
      return new BadRequestException('No file uploaded');
    }

    if (!roomId || !senderId) {
      return new BadRequestException('Missing roomId or senderId');
    }

    const isRoomExist = await this.messengerService.getChatRoomById(roomId);

    if (!isRoomExist || isRoomExist instanceof HttpException) {
      return new BadRequestException('Room not found');
    }

    const isUserExist = await this.userService.get_user_by_id(senderId);

    if (!isUserExist || isUserExist instanceof HttpException) {
      return new BadRequestException('User not found');
    }

    const imageUrl = await this.messengerService.uplaodImage(file);

    const message = await this.messengerService.sendMessage(
      roomId,
      senderId,
      imageUrl as string,
      MessageType.IMAGE,
    );

    this.chatGateway.server
      .to(roomId)
      .emit('newMessage', { ...message, roomId: message.room_id });

    return {
      success: true,
      message: 'Image uploaded successfully',
      publicUrl: imageUrl,
    };
  }
}
