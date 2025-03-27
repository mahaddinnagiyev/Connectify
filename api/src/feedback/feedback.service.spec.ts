import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackService } from './feedback.service';
import { MailerService } from '@nestjs-modules/mailer';
import { SupabaseService } from '../supabase/supabase.service';
import { LoggerService } from '../logger/logger.service';
import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { CreateFeedbackDTO } from './dto/create-feedback-dto';

describe('FeedbackService', () => {
  let service: FeedbackService;
  let mailService: MailerService;
  let supabaseService: SupabaseService;
  let loggerService: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        {
          provide: SupabaseService,
          useValue: {
            getClient: jest.fn().mockReturnValue({
              from: jest.fn().mockReturnThis(),
              insert: jest.fn(),
            }),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            info: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FeedbackService>(FeedbackService);
    mailService = module.get<MailerService>(MailerService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send feedback successfully', async () => {
    const feedback: CreateFeedbackDTO = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      message: 'Great service!',
    };

    const sendMailSpy = jest.spyOn(mailService, 'sendMail');
    const infoSpy = jest.spyOn(loggerService, 'info');

    const result = await service.sendFeedback(feedback);

    if (result instanceof HttpException) {
      expect(result).toBeInstanceOf(HttpException);
    } else {
      expect(result.success).toBe(true);
      expect(result.message).toBe('Feedback has been sent successfully');
      expect(sendMailSpy).toHaveBeenCalled();
      expect(infoSpy).toHaveBeenCalled();
    }
  });

  it('should handle error in feedback sending', async () => {
    const feedback: CreateFeedbackDTO = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      message: 'Great service!',
    };

    const error = new Error('Test error');
    const errorSpy = jest.spyOn(loggerService, 'error');

    try {
      await service.sendFeedback(feedback);
    } catch (e) {
      expect(e).toBeInstanceOf(InternalServerErrorException);
      expect(errorSpy).toHaveBeenCalledWith(
        error.message,
        'feedback',
        'There was an error in sending feedback function',
        error.stack,
      );
    }
  });
});
