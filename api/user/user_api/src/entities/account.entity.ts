import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from "typeorm";
import { User } from "./user.entity";
import { v4 as uuid } from "uuid";


@Entity('accounts')
export class Account {

    @PrimaryColumn('uuid', { default: uuid() })
    id: string;

    @OneToOne(() => User, (user) => user.id, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column({ nullable: true })
    bio: string

    @Column({ nullable: true })
    location: string

    @Column({ nullable: true })
    profile_picture: string;

    @Column("text", { nullable: true, array: true, default: [] })
    social_links: string[];

    @Column({ type: "timestamp", nullable: true })
    last_login: Date;
    
    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}