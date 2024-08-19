import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginData: { username: string; password: string }) {
    return this.authService.login(loginData.username, loginData.password);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  logout(@Body('username') username: string): string {
    return this.authService.logout(username);
  }
}
