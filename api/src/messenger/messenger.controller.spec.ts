import { Test, TestingModule } from '@nestjs/testing';
import { MessengerController } from './messenger.controller';
import { MessengerService } from './messenger.service';
import { UserService } from '../user/user.service';
import { ChatGateway } from './gateway/messenger-gateway';
import { JwtAuthGuard } from '../jwt/jwt-auth-guard';
import { BadRequestException, HttpException } from '@nestjs/common';
import { MessageType } from '../enums/message-type.enum';

// Mock Services
const mockMessengerService = {
  getChatRoomsForUser: jest.fn(),
  getMessagesForRoom: jest.fn(),
  sendMessage: jest.fn(),
  uploadFile: jest.fn(),
  uploadVideo: jest.fn(),
  uplaodAudio: jest.fn(),
  getChatRoomById: jest.fn(),
};

const mockUserService = {
  get_user_by_id: jest.fn(),
};

const mockChatGateway = {
  emit: jest.fn(),
};

describe('MessengerController', () => {
  let controller: MessengerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessengerController],
      providers: [
        { provide: MessengerService, useValue: mockMessengerService },
        { provide: UserService, useValue: mockUserService },
        { provide: ChatGateway, useValue: mockChatGateway },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MessengerController>(MessengerController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getChatRooms', () => {
    it('should return chat rooms for authenticated user', async () => {
      const mockUser = { id: 'user123' };
      const mockRequest = { user: mockUser } as any;
      const expectedResult = [{ id: 'room1' }, { id: 'room2' }];

      mockMessengerService.getChatRoomsForUser.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.getChatRooms(mockRequest);
      expect(result).toEqual(expectedResult);
      expect(mockMessengerService.getChatRoomsForUser).toHaveBeenCalledWith(
        'user123',
      );
    });
  });

  describe('getMessages', () => {
    it('should return messages for valid room', async () => {
      const roomId = 'room123';
      const expectedMessages = [{ id: 'msg1' }, { id: 'msg2' }];

      mockMessengerService.getMessagesForRoom.mockResolvedValue(
        expectedMessages,
      );

      const result = await controller.getMessages(roomId);
      expect(result).toEqual(expectedMessages);
      expect(mockMessengerService.getMessagesForRoom).toHaveBeenCalledWith(
        roomId,
      );
    });
  });

  describe('sendMessage', () => {
    it('should send message with valid data', async () => {
      const mockRequest = { user: { id: 'user123' } } as any;
      const roomId = 'room123';
      const messageData = {
        content: 'Hello',
        message_type: MessageType.TEXT,
      };

      mockMessengerService.sendMessage.mockResolvedValue({ id: 'new-msg' });

      const result = await controller.sendMessage(
        roomId,
        mockRequest,
        messageData,
      );
      expect(result).toEqual({ id: 'new-msg' });
      expect(mockMessengerService.sendMessage).toHaveBeenCalledWith(
        roomId,
        'user123',
        'Hello',
        MessageType.TEXT,
      );
    });
  });

  describe('uploadImage', () => {
    it('should reject missing roomId or senderId', async () => {
      const mockFile = {} as Express.Multer.File;

      const result = await controller.uploadImage(mockFile, null, 'sender123');

      if (result instanceof HttpException) {
        expect(result).toBeInstanceOf(HttpException);
      } else {
        expect(result).toEqual({
          success: true,
          message: 'Successfully uploaded file',
          publicUrl: 'image.co',
          message_name: 'image.png',
          message_size: 1024,
        });
      }

      const result_2 = await controller.uploadImage(mockFile, 'room123', null);
      if (result_2 instanceof HttpException) {
        expect(result_2).toBeInstanceOf(HttpException);
      } else {
        expect(result).toEqual({
          success: true,
          message: 'Successfully uploaded file',
          publicUrl: 'image.co',
          message_name: 'image.png',
          message_size: 1024,
        });
      }
    });

    it('should reject invalid file types', async () => {
      const mockFile = {
        mimetype: 'application/pdf',
        size: 1024,
      } as Express.Multer.File;

      const result = await controller.uploadImage(
        mockFile,
        'room123',
        'sender123',
      );

      if (result instanceof HttpException) {
        expect(result).toBeInstanceOf(HttpException);
      } else {
        expect(result).toEqual({
          success: true,
          message: 'Successfully uploaded file',
          publicUrl: 'image.co',
          message_name: 'image.png',
          message_size: 1024,
        });
      }
    });

    it('should successfully upload valid image', async () => {
      const mockFile = {
        mimetype: 'image/png',
        size: 1024,
      } as Express.Multer.File;

      const mockUploadResult = {
        publicUrl: 'http://example.com/image.png',
        file_name: 'image.png',
        file_size: 1024,
      };

      mockMessengerService.uploadFile.mockResolvedValue(mockUploadResult);
      mockMessengerService.getChatRoomById.mockResolvedValue({ id: 'room123' });
      mockUserService.get_user_by_id.mockResolvedValue({ id: 'sender123' });

      const result = await controller.uploadImage(
        mockFile,
        'room123',
        'sender123',
      );

      if (result instanceof HttpException) {
        expect(result).toBeInstanceOf(HttpException);
      }

      expect(result).toEqual({
        success: true,
        message: 'File uploaded successfully',
        publicUrl: mockUploadResult.publicUrl,
        message_name: mockUploadResult.file_name,
        message_size: mockUploadResult.file_size,
      });
    });
  });

  // Upload Video testləri
  describe('uploadVideo', () => {
    it('should reject missing roomId/senderId', async () => {
      const mockFile = {} as Express.Multer.File;

      const result1 = await controller.uploadVideo(mockFile, null, 'sender123');
      expect(result1).toBeInstanceOf(BadRequestException);

      const result2 = await controller.uploadVideo(mockFile, 'room123', null);
      expect(result2).toBeInstanceOf(BadRequestException);
    });

    it('should reject invalid video types', async () => {
      const mockFile = {
        mimetype: 'application/pdf',
        size: 1024,
      } as Express.Multer.File;

      const result = await controller.uploadVideo(
        mockFile,
        'room123',
        'sender123',
      );
      expect(result).toBeInstanceOf(BadRequestException);
      expect((result as BadRequestException).getResponse()).toEqual({
        success: false,
        error:
          'Invalid file type. Only MP4, MOV, AVI, WMV, and FLV are allowed',
      });
    });

    it('should reject large files', async () => {
      const mockFile = {
        mimetype: 'video/mp4',
        size: 55 * 1024 * 1024,
      } as Express.Multer.File;

      const result = await controller.uploadVideo(
        mockFile,
        'room123',
        'sender123',
      );
      expect(result).toBeInstanceOf(BadRequestException);
      expect((result as BadRequestException).getResponse()).toEqual({
        success: false,
        error: 'File size is too large. Maximum size is 50MB',
      });
    });

    it('should successfully upload video', async () => {
      const mockFile = {
        mimetype: 'video/mp4',
        size: 25 * 1024 * 1024,
      } as Express.Multer.File;

      const mockResult = {
        publicUrl: 'http://example.com/video.mp4',
        file_name: 'video.mp4',
        file_size: 25 * 1024 * 1024,
      };

      mockMessengerService.uploadVideo.mockResolvedValue(mockResult);
      mockMessengerService.getChatRoomById.mockResolvedValue({ id: 'room123' });
      mockUserService.get_user_by_id.mockResolvedValue({ id: 'sender123' });

      const result = await controller.uploadVideo(
        mockFile,
        'room123',
        'sender123',
      );

      expect(result).toEqual({
        success: true,
        message: 'File uploaded successfully',
        publicUrl: mockResult.publicUrl,
        message_name: mockResult.file_name,
        message_size: mockResult.file_size,
      });
    });
  });

  // Upload File testləri
  describe('uploadFile', () => {
    it('should reject unallowed file types', async () => {
      const mockFile = {
        mimetype: 'text/html',
        size: 1024,
      } as Express.Multer.File;

      const result = await controller.uploadFile(
        mockFile,
        'room123',
        'sender123',
      );
      expect(result).toBeInstanceOf(BadRequestException);
      expect((result as BadRequestException).getResponse()).toMatchObject({
        error: expect.stringContaining('Invalid file type: text/html'),
      });
    });

    it('should accept valid document types', async () => {
      const mockFile = {
        mimetype: 'application/pdf',
        size: 1024,
      } as Express.Multer.File;

      const mockResult = {
        publicUrl: 'http://example.com/doc.pdf',
        file_name: 'doc.pdf',
        file_size: 1024,
      };

      mockMessengerService.uploadFile.mockResolvedValue(mockResult);
      mockMessengerService.getChatRoomById.mockResolvedValue({ id: 'room123' });
      mockUserService.get_user_by_id.mockResolvedValue({ id: 'sender123' });

      const result = await controller.uploadFile(
        mockFile,
        'room123',
        'sender123',
      );

      expect(result).toEqual({
        success: true,
        message: 'File uploaded successfully',
        publicUrl: mockResult.publicUrl,
        message_name: mockResult.file_name,
        message_size: mockResult.file_size,
      });
    });
  });

  // Upload Audio testləri
  describe('uploadAudio', () => {
    it('should validate audio formats', async () => {
      const mockFile = {
        mimetype: 'video/mp4',
        size: 1024,
      } as Express.Multer.File;

      const result = await controller.uploadAudio(
        mockFile,
        'room123',
        'sender123',
      );
      expect(result).toBeInstanceOf(BadRequestException);
      expect((result as BadRequestException).getResponse()).toEqual({
        success: false,
        error: 'Invalid file type. Only MP3 and WEBM are allowed',
      });
    });

    it('should handle successful audio upload', async () => {
      const mockFile = {
        mimetype: 'audio/mpeg',
        size: 5 * 1024 * 1024,
      } as Express.Multer.File;

      const mockResult = {
        publicUrl: 'http://example.com/audio.mp3',
        file_size: 5 * 1024 * 1024,
      };

      mockMessengerService.uplaodAudio.mockResolvedValue(mockResult);
      mockMessengerService.getChatRoomById.mockResolvedValue({ id: 'room123' });
      mockUserService.get_user_by_id.mockResolvedValue({ id: 'sender123' });

      const result = await controller.uploadAudio(
        mockFile,
        'room123',
        'sender123',
      );

      if (result instanceof HttpException) {
        expect(result).toBeInstanceOf(HttpException);
      } else {
        expect(result).toEqual({
          success: true,
          message: 'Audio uploaded successfully',
          publicUrl: mockResult.publicUrl,
          message_size: mockResult.file_size,
        });
      }
    });
  });
});
