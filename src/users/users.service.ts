import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/schema/user.entity';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { CreateUserDto } from './create-user.dto';
import { validate } from 'class-validator';
import { emit } from 'process';

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

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async create(payload: CreateUserDto): Promise<any> {
    const { username, password, confirmPassword } = payload;

    if (password !== confirmPassword) {
      return {
        code: 400,
        message: 'Password and confirm password do not match',
      };
    }
    const user = await this.usersRepository.findOneBy({ username });
    console.log('user', user);
    if (user) {
      return {
        code: 400,
        message: 'Username already exists',
      };
    }
    const salt = this.generateSalt();
    const hashedPassword = this.hashPassword(password, salt);
    const UserPayload = {
      username: payload.username,
      email: payload.email,
      password: hashedPassword,
      createdAt: new Date().getTime(),
      salt,
    };
    payload.password = hashedPassword;
    try {
      console.log('UserPayload', UserPayload);
      const newUser = this.usersRepository.create(UserPayload);
      console.log('newUser', newUser);
      await this.usersRepository.save(newUser);
      return {
        code: 201,
        msg: 'User created successfully',
      };
    } catch (error) {
      return {
        code: 500,
        message: 'Internal server error',
      };
    }
  }

  private generateSalt(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  private hashPassword(password: string, salt: string): string {
    const hash = crypto.createHmac('sha256', salt);
    hash.update(password);
    return hash.digest('hex');
  }
}
