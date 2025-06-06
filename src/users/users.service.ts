import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../schema/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User> {
    return this.usersRepository.findOneBy({ id });
  }

  findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOneBy({ email });
  }

  findByUsername(userName: string): Promise<User> {
    return this.usersRepository.findOneBy({ userName });
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async createUser(payload: Partial<User>): Promise<User> {
    const { email } = payload;
    const existEmail = await this.usersRepository.findOneBy({ email });
    if (existEmail) {
      throw new ConflictException('email already exists');
    }
    try {
      const newUser = this.usersRepository.create(payload);
      return await this.usersRepository.save(newUser);
    } catch (error) {
      console.log('error', error);
      throw new InternalServerErrorException('server error');
    }
  }
}
