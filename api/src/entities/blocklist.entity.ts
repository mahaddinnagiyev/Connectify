import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('block_lists')
export class BlockList {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.outgoingBlocks, { onDelete: 'CASCADE' })
  blocker: User;

  @ManyToOne(() => User, (user) => user.incomingBlocks, { onDelete: 'CASCADE' })
  blocked: User;

  @CreateDateColumn()
  created_at: Date;
}
