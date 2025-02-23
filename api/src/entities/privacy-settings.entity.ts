import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PrivacySettings as privacySettings } from 'src/enums/privacy-settings.enum';
import { Account } from './account.entity';

@Entity('privacy_settings')
export class PrivacySettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Account, (account) => account.privacy, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({
    type: 'enum',
    enum: privacySettings,
    default: privacySettings.everyone,
  })
  email: privacySettings;

  @Column({
    type: 'enum',
    enum: privacySettings,
    default: privacySettings.everyone,
  })
  gender: privacySettings;

  @Column({
    type: 'enum',
    enum: privacySettings,
    default: privacySettings.everyone,
  })
  bio: privacySettings;

  @Column({
    type: 'enum',
    enum: privacySettings,
    default: privacySettings.everyone,
  })
  location: privacySettings;

  @Column({
    type: 'enum',
    enum: privacySettings,
    default: privacySettings.everyone,
  })
  social_links: privacySettings;

  @Column({
    type: 'enum',
    enum: privacySettings,
    default: privacySettings.everyone,
  })
  last_login: privacySettings;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
