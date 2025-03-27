import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateFeedbackDTO } from './dto/create-feedback-dto';
import { newFeedbackMessage } from './utils/messages/new-feedback-message';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly logger: LoggerService,
    private readonly mailService: MailerService,
  ) {}

  async sendFeedback(feedback: CreateFeedbackDTO) {
    try {
      await this.supabase.getClient().from('feedbacks').insert(feedback);

      await this.mailService.sendMail({
        to: process.env.EMAIL_SECOND_USER,
        subject: 'Recieved new feedback message - Connectify',
        html: newFeedbackMessage(
          feedback.first_name,
          feedback.last_name,
          feedback.email,
          feedback.message,
          new Date(),
        ),
      });

      await this.logger.info(
        'New feedback message has been sent',
        'feedback',
        `User: ${feedback.first_name} ${feedback.last_name}\nemail: ${feedback.email}\nmessage: ${feedback.message}\nsend_date: ${new Date()}`,
      );

      return {
        success: true,
        message: 'Feedback has been sent successfully',
      };
    } catch (error) {
      await this.logger.error(
        error.message,
        'feedback',
        'There was an error in sending feedback function',
        error.stack,
      );
      return new InternalServerErrorException(
        'Failed To Send Feedback - Due To Internal Server Error',
      );
    }
  }
}
