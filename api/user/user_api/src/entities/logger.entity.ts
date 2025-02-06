import { LogLevels } from 'src/enums/log-levels.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('user_logs')
export class Logger {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  level: LogLevels;

  @Column()
  message: string;

  @Column()
  module: string;

  @Column({ type: 'text', nullable: true })
  stack?: string;

  @Column({ type: "text", nullable: true })
  details?: string;

  @CreateDateColumn()
  created_at: Date;
}
