import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}
  login(username: string, password: string) {
    const payload = { username: username, sub: 'userId' };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  logout(username: string): string {
    return `${username} login out`;
  }
}
