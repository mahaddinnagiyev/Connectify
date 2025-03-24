import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDTO } from './dto/create-feedback-dto';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('/send')
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: { limit: 30, ttl: 30 * 60 * 1000, blockDuration: 10 * 60 * 1000 },
  })
  async sendFeedback(@Body() feedback: CreateFeedbackDTO) {
    return await this.feedbackService.sendFeedback(feedback);
  }
}
