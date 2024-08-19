import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  login(username: string, password: string): string {
    return `${username} login success`;
  }

  logout(username: string): string {
    return `${username} login out`;
  }
}
