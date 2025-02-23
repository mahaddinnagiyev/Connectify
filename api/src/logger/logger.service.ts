import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'src/entities/logger.entity';
import { LogLevels } from 'src/enums/log-levels.enum';
import { Repository } from 'typeorm';

@Injectable()
export class LoggerService {
  constructor(
    @InjectRepository(Logger)
    private loggerRepository: Repository<Logger>,
  ) {}

  private async log(
    level: LogLevels,
    message: string,
    module: string,
    details?: string,
    stack?: string,
  ) {
    const logger = this.loggerRepository.create({
      level: level,
      message: message,
      module: module,
      details: details,
      stack: stack,
    });

    await this.loggerRepository.save(logger);
  }

  async emerg(message: string, module: string, details?: string, stack?: string) {
    return this.log(LogLevels.emerg, message, module, details, stack);
  }

  async alert(message: string, module: string, details?: string, stack?: string) {
    return this.log(LogLevels.alert, message, module, details, stack);
  }

  async crit(message: string, module: string, details?: string, stack?: string) {
    return this.log(LogLevels.crit, message, module, details, stack);
  }

  async error(message: string, module: string, details?: string, stack?: string) {
    return this.log(LogLevels.error, message, module, details, stack);
  }

  async warn(message: string, module: string, details?: string, stack?: string) {
    return this.log(LogLevels.warn, message, module, details, stack);
  }

  async notice(message: string, module: string, details?: string, stack?: string) {
    return this.log(LogLevels.notice, message, module, details, stack);
  }

  async info(message: string, module: string, details?: string, stack?: string) {
    return this.log(LogLevels.info, message, module, details, stack);
  }

  async debug(message: string, module: string, details?: string, stack?: string) {
    return this.log(LogLevels.debug, message, module, details, stack);
  }
}
