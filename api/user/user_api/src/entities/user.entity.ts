import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Gender } from 'src/enums/gender.enum';
import { Account } from './account.entity';
import { Provider } from 'src/enums/provider.enum';
import { Friendship } from './friendship.entity';
import { Exclude } from 'class-transformer';
import { BlockList } from './blocklist.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  first_name: string;

  @Column({ nullable: false })
  last_name: string;

  @Column({ nullable: false, unique: true })
  username: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({
    nullable: false,
    enum: Gender,
    type: 'enum',
    default: Gender.notProvided,
  })
  gender: Gender;

  @Column({ nullable: false, default: false })
  is_admin: boolean;

  @Column({ nullable: false, default: false })
  is_banned: boolean;

  @Column({ nullable: true })
  @Exclude()
  password: string;

  @OneToOne(() => Account, (account) => account.user)
  account: Account;

  @OneToMany(() => Friendship, (friendship) => friendship.requester)
  sentFriendRequests: Friendship[];

  @OneToMany(() => Friendship, (friendship) => friendship.requestee)
  receivedFriendRequests: Friendship[];

  @OneToMany(() => BlockList, (block) => block.blocker)
  outgoingBlocks: BlockList[];

  @OneToMany(() => BlockList, (block) => block.blocked)
  incomingBlocks: BlockList[];

  @Column({
    nullable: false,
    enum: Provider,
    type: 'enum',
    default: Provider.normal,
  })
  provider: Provider;

  @Column({ nullable: true })
  reset_token: string;

  @Column({ nullable: true })
  reset_token_expiration: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
