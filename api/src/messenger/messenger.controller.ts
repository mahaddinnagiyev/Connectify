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
import { MessageType } from '../enums/message-type.enum';
import { JwtAuthGuard } from '../jwt/jwt-auth-guard';
import { IUser } from '../interfaces/user.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChatGateway } from './gateway/messenger-gateway';
import {
  MulterAudioConfig,
  MulterFileConfig,
  MulterImageConfig,
  MulterVideoConfig,
} from '../supabase/utils/multer-config';
import { UserService } from '../user/user.service';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

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

  @UseGuards(JwtAuthGuard)
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: { limit: 60, ttl: 60 * 1000, blockDuration: 60 * 1000 },
  })
  @Get('message/:messageId')
  async getMessageById(@Param('messageId') messageId: string) {
    return await this.messengerService.getMessageById(messageId);
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
    if (!roomId || !senderId) {
      return new BadRequestException('Missing roomId or senderId');
    }

    if (!file) {
      return new BadRequestException('No file uploaded');
    }

    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|ico|svg|tiff)$/)) {
      return new BadRequestException({
        success: false,
        error:
          'Invalid file type. Only JPG, JPEG, PNG, GIF, WEBP, ICO, SVG, TIFF are allowed',
      });
    }

    if (file.size > 25 * 1024 * 1024) {
      return new BadRequestException({
        success: false,
        error: 'File size is too large. Maximum size is 25MB',
      });
    }

    const isRoomExist = await this.messengerService.getChatRoomById(roomId);

    if (!isRoomExist || isRoomExist instanceof HttpException) {
      return new BadRequestException('Room not found');
    }

    const isUserExist = await this.userService.get_user_by_id(senderId);

    if (!isUserExist || isUserExist instanceof HttpException) {
      return new BadRequestException('User not found');
    }

    const uploadedImage = await this.messengerService.uploadFile(file);

    if (uploadedImage instanceof HttpException) {
      return uploadedImage;
    }

    return {
      success: true,
      message: 'File uploaded successfully',
      publicUrl: uploadedImage.publicUrl,
      message_name: uploadedImage.file_name,
      message_size: uploadedImage.file_size,
    };
  }

  // Upload Video
  @Post('upload-video')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor(
      'message_video',
      new MulterVideoConfig().createMulterOptions(),
    ),
  )
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Query('roomId') roomId: string,
    @Query('senderId') senderId: string,
  ) {
    if (!roomId || !senderId) {
      return new BadRequestException('Missing roomId or senderId');
    }

    if (!file) {
      return new BadRequestException('No file uploaded');
    }

    if (!file.mimetype.match(/\/(mp4|mov|avi|wmv|flv)$/)) {
      return new BadRequestException({
        success: false,
        error:
          'Invalid file type. Only MP4, MOV, AVI, WMV, and FLV are allowed',
      });
    }

    if (file.size > 50 * 1024 * 1024) {
      return new BadRequestException({
        success: false,
        error: 'File size is too large. Maximum size is 50MB',
      });
    }

    const isRoomExist = await this.messengerService.getChatRoomById(roomId);

    if (!isRoomExist || isRoomExist instanceof HttpException) {
      return new BadRequestException('Room not found');
    }

    const isUserExist = await this.userService.get_user_by_id(senderId);

    if (!isUserExist || isUserExist instanceof HttpException) {
      return new BadRequestException('User not found');
    }

    const uploadedVideo = await this.messengerService.uploadVideo(file);

    if (uploadedVideo instanceof HttpException) {
      return uploadedVideo;
    }

    return {
      success: true,
      message: 'File uploaded successfully',
      publicUrl: uploadedVideo.publicUrl,
      message_name: uploadedVideo.file_name,
      message_size: uploadedVideo.file_size,
    };
  }

  // Upload File
  @Post('upload-file')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor(
      'message_file',
      new MulterFileConfig().createMulterOptions(),
    ),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('roomId') roomId: string,
    @Query('senderId') senderId: string,
  ) {
    if (!roomId || !senderId) {
      return new BadRequestException('Missing roomId or senderId');
    }

    if (!file) {
      return new BadRequestException('No file uploaded');
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      return new BadRequestException({
        success: false,
        error:
          `Invalid file type: ${file.mimetype}. Allowed types: ` +
          'TXT, DOC/DOCX, PDF, PPT/PPTX, XLS/XLSX, ' +
          'JPG, PNG, GIF, WEBP, ICO, SVG, MP3, MP4',
      });
    }

    if (file.size > 50 * 1024 * 1024) {
      return new BadRequestException({
        success: false,
        error: 'File size is too large. Maximum size is 50MB',
      });
    }

    const isRoomExist = await this.messengerService.getChatRoomById(roomId);

    if (!isRoomExist || isRoomExist instanceof HttpException) {
      return new BadRequestException('Room not found');
    }

    const isUserExist = await this.userService.get_user_by_id(senderId);

    if (!isUserExist || isUserExist instanceof HttpException) {
      return new BadRequestException('User not found');
    }

    const uploadedFile = await this.messengerService.uploadFile(file);

    if (uploadedFile instanceof HttpException) {
      return uploadedFile;
    }

    return {
      success: true,
      message: 'File uploaded successfully',
      publicUrl: uploadedFile.publicUrl,
      message_name: uploadedFile.file_name,
      message_size: uploadedFile.file_size,
    };
  }

  // Upload Audio
  @Post('upload-audio')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor(
      'message_audio',
      new MulterAudioConfig().createMulterOptions(),
    ),
  )
  async uploadAudio(
    @UploadedFile() file: Express.Multer.File,
    @Query('roomId') roomId: string,
    @Query('senderId') senderId: string,
  ) {
    if (!roomId || !senderId) {
      return new BadRequestException('Missing roomId or senderId');
    }

    if (!file) {
      return new BadRequestException('No file uploaded');
    }

    if (!file.mimetype.match(/\/(mp3|webm|wav|ogg|x-wav)$/)) {
      return new BadRequestException({
        success: false,
        error: 'Invalid file type. Only MP3 and WEBM are allowed',
      });
    }

    if (file.size > 50 * 1024 * 1024) {
      return new BadRequestException({
        success: false,
        error: 'File size is too large. Maximum size is 50MB',
      });
    }

    const isRoomExist = await this.messengerService.getChatRoomById(roomId);

    if (!isRoomExist || isRoomExist instanceof HttpException) {
      return new BadRequestException('Room not found');
    }

    const isUserExist = await this.userService.get_user_by_id(senderId);

    if (!isUserExist || isUserExist instanceof HttpException) {
      return new BadRequestException('User not found');
    }

    const Audio = await this.messengerService.uplaodAudio(file);

    if (Audio instanceof HttpException) {
      return Audio;
    }

    return {
      success: true,
      message: 'Audio uploaded successfully',
      publicUrl: Audio.publicUrl,
      message_size: Audio.file_size,
    };
  }

  private allowedMimeTypes = [
    'text/plain',
    'text/csv',
    'application/x-zip-compressed',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/x-icon',
    'image/svg+xml',

    'audio/mpeg',
    'video/mp4',
    'video/mov',
    'video/avi',
    'video/wmv',
    'video/flv',
  ];
}
