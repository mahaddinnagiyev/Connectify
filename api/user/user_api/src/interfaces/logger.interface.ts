import { LogLevels } from 'src/enums/log-levels.enum';

export interface ILogger {
  id: string;
  level: LogLevels;
  message: string;
  module: string;
  stack?: string;
  details?: string;
  created_at: Date;
}
