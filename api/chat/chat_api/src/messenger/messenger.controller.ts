// messenger.controller.ts
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MessengerService } from './messenger.service';
import { Request } from 'express';
import { MessageType } from 'src/enums/message-type.enum';
import { JwtAuthGuard } from 'src/jwt/jwt-auth-guard';
import { IUser } from 'src/interfaces/user.interface';

@Controller('messenger')
export class MessengerController {
  constructor(private readonly messengerService: MessengerService) {}

  // İstifadəçinin qatıldığı chat room-ların siyahısı
  @UseGuards(JwtAuthGuard)
  @Get('chat-rooms')
  async getChatRooms(@Req() req: Request) {
    const userId = (req.user as IUser).id;
    return await this.messengerService.getChatRoomsForUser(userId);
  }

  // Seçilmiş chat room-dakı mesajları alırıq
  @UseGuards(JwtAuthGuard)
  @Get('chat-rooms/:roomId/messages')
  async getMessages(@Param('roomId') roomId: string) {
    return await this.messengerService.getMessagesForRoom(roomId);
  }

  // Yeni mesaj göndəririk. Sender id token-dən alınır.
  @UseGuards(JwtAuthGuard)
  @Post('chat-rooms/:roomId/messages')
  async sendMessage(
    @Param('roomId') roomId: string,
    @Req() req: Request,
    @Body() body: { content: string; message_type: MessageType },
  ) {
    const senderId = (req.user as IUser).id;
    return await this.messengerService.sentMessage(
      roomId,
      senderId,
      body.content,
      body.message_type,
    );
  }
}
