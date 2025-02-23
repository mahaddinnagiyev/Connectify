import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { PrivacySettings } from './privacy-settings.entity';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  profile_picture: string;

  @Column({ type: 'json', nullable: true })
  social_links: { id: string; name: string; link: string }[];

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;

  @OneToOne(() => PrivacySettings, (privacy) => privacy.account, {
    cascade: true,
    eager: true,
  })
  privacy: PrivacySettings;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
