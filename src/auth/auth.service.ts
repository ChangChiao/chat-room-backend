import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
  ) {}

  async validateGoogleUser(email: string) {
    let user = await this.userService.findByEmail(email);
    if (!user) {
      user = await this.userService.createUser({
        email,
        userName: email,
      });
    }
    return user;
  }

  async generateJwtToken(user: any) {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload);
  }

  async register(registerDto: RegisterDto) {
    const { userName, email, password } = registerDto;

    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('email already exists');
    }

    // encrypt password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // create new user
    const user = await this.userService.createUser({
      userName,
      email,
      password: hashedPassword,
    });

    return user;
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // find user by username
    const user = await this.userService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // generate JWT token
    const token = await this.generateJwtToken(user);

    return { user, token };
  }

  async validateUser(id: number) {
    return this.userService.findOne(id);
  }
}
