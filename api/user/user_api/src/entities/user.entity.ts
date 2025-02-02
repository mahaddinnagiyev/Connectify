import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne } from "typeorm";
import { Gender } from "src/enums/gender.enum";
import { Account } from "./account.entity";
import { v4 as uuid } from "uuid";


@Entity('users')
export class User {

    @PrimaryColumn('uuid', { default: uuid() })
    id: string;

    @Column({ nullable: false })
    first_name: string;

    @Column({ nullable: false })
    last_name: string;

    @Column({ nullable: false, unique: true })
    username: string;

    @Column({ nullable: false, unique: true })
    email: string;

    @Column({ nullable: false, enum: Gender, type: "enum" })
    gender: Gender;

    @Column({ nullable: false, default: false })
    is_admin: boolean

    @Column({ nullable: false })
    password: string

    @OneToOne(() => Account, (account) => account.user)
    account: Account

    @Column({ nullable: true })
    reset_token: string

    @Column({ nullable: true })
    reset_token_expiration: Date
    
    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}