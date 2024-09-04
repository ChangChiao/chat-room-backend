import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Timestamp,
  ManyToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Message } from './message.entity';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp;

  @ManyToMany(() => User, (user) => user.rooms)
  roomMembers: User[];

  @OneToMany(() => Message, (message) => message.room)
  messages: Message[];
}
