import { Entity, Column, PrimaryGeneratedColumn, Timestamp } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  userName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  googleId: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  googleEmail: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Timestamp;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatarUrl: string;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Timestamp;

  // @OneToMany(() => Message, (message) => message.user)
  // messages: Message[];

  // @ManyToMany(() => Room, (room) => room.roomMembers)
  // @JoinTable()
  // rooms: Room[];
}
