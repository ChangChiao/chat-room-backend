import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Timestamp,
  OneToMany,
} from 'typeorm';
import { Message } from './message.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  googleId: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  googleEmail: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Timestamp;

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[];
}
