import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { errorMessage } from '../auth/utils/messages/error/error-message';
import { LogLevels } from '../enums/log-levels.enum';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class LoggerService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly mailService: MailerService,
  ) {}

  private async log(
    level: LogLevels,
    message: string,
    module: string,
    details?: string,
    stack?: string,
  ) {
    await this.supabase.getClient().from('user_logs').insert({
      level: level,
      message: message,
      module: module,
      details: details,
      stack: stack,
    });
  }

  async emerg(
    message: string,
    module: string,
    details?: string,
    stack?: string,
  ) {
    await this.mailService.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_SECOND_USER,
      subject: 'There is an error(emerg) in the application - Connectify',
      html: errorMessage(message, module, details, stack),
    });
    return this.log(LogLevels.emerg, message, module, details, stack);
  }

  async alert(
    message: string,
    module: string,
    details?: string,
    stack?: string,
  ) {
    return this.log(LogLevels.alert, message, module, details, stack);
  }

  async crit(
    message: string,
    module: string,
    details?: string,
    stack?: string,
  ) {
    return this.log(LogLevels.crit, message, module, details, stack);
  }

  async error(
    message: string,
    module: string,
    details?: string,
    stack?: string,
  ) {
    await this.mailService.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_SECOND_USER,
      subject: 'There is an error in the application - Connectify',
      html: errorMessage(message, module, details, stack),
    });
    return this.log(LogLevels.error, message, module, details, stack);
  }

  async warn(
    message: string,
    module: string,
    details?: string,
    stack?: string,
  ) {
    return this.log(LogLevels.warn, message, module, details, stack);
  }

  async notice(
    message: string,
    module: string,
    details?: string,
    stack?: string,
  ) {
    return this.log(LogLevels.notice, message, module, details, stack);
  }

  async info(
    message: string,
    module: string,
    details?: string,
    stack?: string,
  ) {
    return this.log(LogLevels.info, message, module, details, stack);
  }

  async debug(
    message: string,
    module: string,
    details?: string,
    stack?: string,
  ) {
    return this.log(LogLevels.debug, message, module, details, stack);
  }
}
