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
import { PrivacySettings } from 'src/enums/privacy-settings.enum';

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

  @Column({
    type: 'json',
    nullable: true,
    default: {
      email: PrivacySettings.everyone,
      gender: PrivacySettings.everyone,
      bio: PrivacySettings.everyone,
      location: PrivacySettings.everyone,
      social_links: PrivacySettings.everyone,
    },
  })
  privacy_settings: {
    email?: PrivacySettings;
    gender?: PrivacySettings;
    bio?: PrivacySettings;
    location?: PrivacySettings;
    social_links?: PrivacySettings;
  };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
