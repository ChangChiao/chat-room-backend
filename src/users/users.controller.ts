import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ConflictException,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { User } from 'src/schema/user.entity';
import { UsersService } from './users.service';
import { UserPayload } from 'src/model';
import { CreateUserDto } from './create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Get('all')
  // @UseGuards(AuthGuard('jwt'))
  async findAll(): Promise<any> {
    try {
      const users = await this.userService.findAll();
      return {
        code: 200,
        message: 'Successfully retrieved all users',
        data: users,
      };
    } catch (error) {
      throw new HttpException(
        {
          code: 500,
          message: 'Failed to retrieve users',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  getProfile(@CurrentUser() user: User) {
    return user;
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<User> {
    return this.userService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.userService.remove(id);
  }
}
