import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginData: { username: string; password: string }): string {
    return this.authService.login(loginData.username, loginData.password);
  }

  @Post('logout')
  logout(@Body('username') username: string): string {
    return this.authService.logout(username);
  }
}
