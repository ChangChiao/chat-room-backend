import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/schema/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './create-user.dto';
import { validate } from 'class-validator';
import { GoogleUserPayload } from 'src/model';

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

  findByUsername(username: string): Promise<User> {
    return this.usersRepository.findOneBy({ username });
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async create(payload: CreateUserDto): Promise<any> {
    const { username, password, confirmPassword, email } = payload;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const UserPayload = {
      username: payload.username,
      email: payload.email,
      password: hashedPassword,
      createdAt: new Date(),
    };
    payload.password = hashedPassword;
    return this.createUser(UserPayload);
  }

  async createUser(payload: any): Promise<any> {
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
