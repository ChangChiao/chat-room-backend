import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Timestamp,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Message } from './message.entity';
import { Room } from './room.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  googleId: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  googleEmail: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  salt: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Timestamp;

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[];

  @ManyToMany(() => Room, (room) => room.roomMembers)
  @JoinTable()
  rooms: Room[];
}
