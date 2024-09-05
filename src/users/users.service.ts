import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/schema/user.entity';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';

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

  create(payload: Partial<User> & { confirmPassword: string }): Promise<any> {
    const { username, password, confirmPassword } = payload;
    if (password !== confirmPassword) {
      return {
        code: 400,
        message: 'Password and confirm password do not match',
      };
    }
    const user = this.usersRepository.findOneBy({ username });
    if (user) {
      return {
        code: 400,
        message: 'Username already exists',
      };
    }
    try {
      const salt = this.generateSalt();
      const hashedPassword = this.hashPassword(password, salt);
      payload.password = hashedPassword;
      payload.salt = salt;
      const newUser = this.usersRepository.create(payload);
      return this.usersRepository.save(newUser);
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
