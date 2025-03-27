import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDTO } from './dto/create-feedback-dto';
import { InternalServerErrorException } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

describe('FeedbackController', () => {
  let controller: FeedbackController;
  let service: FeedbackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedbackController],
      imports: [
        ThrottlerModule.forRoot({
          errorMessage: 'Too many requests, please try again later.',
          throttlers: [
            {
              limit: 10,
              ttl: 60,
            },
          ],
        }),
      ],
      providers: [
        {
          provide: FeedbackService,
          useValue: {
            sendFeedback: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FeedbackController>(FeedbackController);
    service = module.get<FeedbackService>(FeedbackService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call sendFeedback and return success', async () => {
    const feedback: CreateFeedbackDTO = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      message: 'Great service!',
    };

    const result = {
      success: true,
      message: 'Feedback has been sent successfully',
    };
    jest.spyOn(service, 'sendFeedback').mockResolvedValue(result);

    const response = await controller.sendFeedback(feedback);

    expect(response).toEqual(result);
  });

  it('should handle error when sendFeedback fails', async () => {
    const feedback: CreateFeedbackDTO = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      message: 'Great service!',
    };

    const error = new InternalServerErrorException('Failed To Send Feedback');
    jest.spyOn(service, 'sendFeedback').mockRejectedValue(error);

    try {
      await controller.sendFeedback(feedback);
    } catch (e) {
      expect(e).toBeInstanceOf(InternalServerErrorException);
      expect(e.message).toBe('Failed To Send Feedback');
    }
  });
});
