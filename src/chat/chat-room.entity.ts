import { Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../schema/user.entity';

@Entity()
export class ChatRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => User)
  @JoinTable()
  members: User[];
}
