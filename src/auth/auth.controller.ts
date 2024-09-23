import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    try {
      const user = await this.authService.validateGoogleUser(req.user.email);
      const token = await this.authService.generateJwtToken(user);
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1 * 60 * 60 * 1000, //  1hr
      });
      if (user) {
        return res.redirect('http://localhost:5000/chat-list');
      } else {
        return res.redirect('http://localhost:5000/auth-failure');
      }
    } catch (error) {
      console.error('Google auth error:', error);
      return res.redirect('http://localhost:5000/auth-failure');
    }
  }
}
