import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Res,
  HttpCode,
  ConflictException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    // ... existing code ...
    try {
      const user = await this.authService.validateGoogleUser(req.user.email);
      const token = await this.authService.generateJwtToken(user);
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1 * 60 * 60 * 1000, //  1hr
      });
      if (user) {
        return res.redirect('http://localhost:5000/chat');
      } else {
        return res.redirect('http://localhost:5000/auth-failure');
      }
    } catch (error) {
      console.error('Google auth error:', error);
      return res.redirect('http://localhost:5000/auth-failure');
    }
  }

  @Post('register')
  @HttpCode(201)
  async register(@Body() registerDto: RegisterDto) {
    try {
      const user = await this.authService.register(registerDto);
      return {
        code: 201,
        message: 'register success',
        user: { id: user.id, email: user.email, userName: user.userName },
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new HttpException(
          {
            code: 409,
            message: 'email already exists',
          },
          HttpStatus.CONFLICT,
        );
      }
    }
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res) {
    const { user, token } = await this.authService.login(loginDto);

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
      domain:
        process.env.NODE_ENV === 'production'
          ? process.env.COOKIE_DOMAIN
          : undefined,
    });

    return {
      message: 'login success',
      user: { id: user.id, email: user.email, username: user.userName },
    };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Res({ passthrough: true }) res) {
    res.clearCookie('auth_token');
    return { message: 'logout success' };
  }
}
