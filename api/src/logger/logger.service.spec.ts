import { MailerService } from '@nestjs-modules/mailer';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from './logger.service';
import { SupabaseService } from '../supabase/supabase.service';
import { LogLevels } from '../enums/log-levels.enum';
import { errorMessage } from '../auth/utils/messages/error/error-message';

describe('LoggerService', () => {
  let service: LoggerService;
  let mailService: MailerService;
  let supabaseService: SupabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerService,
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
      ],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
    mailService = module.get<MailerService>(MailerService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call log with correct parameters for emerg', async () => {
    const message = 'Test message';
    const module = 'TestModule';
    const details = 'Test details';
    const stack = 'Test stack';
    const sendMailSpy = jest.spyOn(mailService, 'sendMail');
    const logSpy = jest.spyOn(service as any, 'log');
    await service.emerg(message, module, details, stack);
    expect(sendMailSpy).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(
      LogLevels.emerg,
      message,
      module,
      details,
      stack,
    );
  });

  it('should call log with correct parameters for alert', async () => {
    const message = 'Test message';
    const module = 'TestModule';
    const details = 'Test details';
    const stack = 'Test stack';
    const logSpy = jest.spyOn(service as any, 'log');
    await service.alert(message, module, details, stack);
    expect(logSpy).toHaveBeenCalledWith(
      LogLevels.alert,
      message,
      module,
      details,
      stack,
    );
  });

  it('should call log with correct parameters for crit', async () => {
    const message = 'Test message';
    const module = 'TestModule';
    const details = 'Test details';
    const stack = 'Test stack';
    const logSpy = jest.spyOn(service as any, 'log');
    await service.crit(message, module, details, stack);
    expect(logSpy).toHaveBeenCalledWith(
      LogLevels.crit,
      message,
      module,
      details,
      stack,
    );
  });

  it('should call log with correct parameters for error', async () => {
    const message = 'Test message';
    const module = 'TestModule';
    const details = 'Test details';
    const stack = 'Test stack';
    const sendMailSpy = jest.spyOn(mailService, 'sendMail');
    const logSpy = jest.spyOn(service as any, 'log');
    await service.error(message, module, details, stack);
    expect(sendMailSpy).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(
      LogLevels.error,
      message,
      module,
      details,
      stack,
    );
  });

  it('should call log with correct parameters for warn', async () => {
    const message = 'Test message';
    const module = 'TestModule';
    const details = 'Test details';
    const stack = 'Test stack';
    const logSpy = jest.spyOn(service as any, 'log');
    await service.warn(message, module, details, stack);
    expect(logSpy).toHaveBeenCalledWith(
      LogLevels.warn,
      message,
      module,
      details,
      stack,
    );
  });

  it('should call log with correct parameters for notice', async () => {
    const message = 'Test message';
    const module = 'TestModule';
    const details = 'Test details';
    const stack = 'Test stack';
    const logSpy = jest.spyOn(service as any, 'log');
    await service.notice(message, module, details, stack);
    expect(logSpy).toHaveBeenCalledWith(
      LogLevels.notice,
      message,
      module,
      details,
      stack,
    );
  });

  it('should call log with correct parameters for info', async () => {
    const message = 'Test message';
    const module = 'TestModule';
    const details = 'Test details';
    const stack = 'Test stack';
    const logSpy = jest.spyOn(service as any, 'log');
    await service.info(message, module, details, stack);
    expect(logSpy).toHaveBeenCalledWith(
      LogLevels.info,
      message,
      module,
      details,
      stack,
    );
  });

  it('should call log with correct parameters for debug', async () => {
    const message = 'Test message';
    const module = 'TestModule';
    const details = 'Test details';
    const stack = 'Test stack';
    const logSpy = jest.spyOn(service as any, 'log');
    await service.debug(message, module, details, stack);
    expect(logSpy).toHaveBeenCalledWith(
      LogLevels.debug,
      message,
      module,
      details,
      stack,
    );
  });
});
