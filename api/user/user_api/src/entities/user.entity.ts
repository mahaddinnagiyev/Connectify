import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Gender } from 'src/enums/gender.enum';
import { Account } from './account.entity';
import { Provider } from 'src/enums/provider.enum';

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
  password: string;

  @OneToOne(() => Account, (account) => account.user)
  account: Account;

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
