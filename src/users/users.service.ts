import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/schema/user.entity';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
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

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async create(payload: CreateUserDto): Promise<any> {
    const { username, password, confirmPassword, email } = payload;

    if (password !== confirmPassword) {
      return {
        code: 400,
        message: 'Password and confirm password do not match',
      };
    }
    const existEmail = await this.usersRepository.findOneBy({ email });
    if (existEmail) {
      return {
        code: 400,
        message: 'email already registered',
      };
    }
    const salt = this.generateSalt();
    const hashedPassword = this.hashPassword(password, salt);
    const UserPayload = {
      username: payload.username,
      email: payload.email,
      password: hashedPassword,
      createdAt: new Date(),
      salt,
    };
    payload.password = hashedPassword;
    this.createUser(UserPayload);
  }

  async createWithGoogle(payload: GoogleUserPayload): Promise<any> {
    const { email } = payload;
    const existEmail = await this.usersRepository.findOneBy({ email });
    if (existEmail) {
      return {
        code: 400,
        message: 'email already registered',
      };
    }
    this.createUser(payload);
  }

  async createUser(payload: any): Promise<any> {
    try {
      const newUser = this.usersRepository.create(payload);
      await this.usersRepository.save(newUser);
      return {
        code: 201,
        msg: 'User created successfully',
      };
    } catch (error) {
      console.log('error', error);
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
