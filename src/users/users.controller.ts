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
} from '@nestjs/common';
import { User } from 'src/schema/user.entity';
import { UsersService } from './users.service';
import { UserPayload } from 'src/model';
import { CreateUserDto } from './create-user.dto';
@Controller('users')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<User> {
    return this.userService.findOne(id);
  }

  @Post()
  @HttpCode(201)
  async create(@Body() user: CreateUserDto): Promise<any> {
    try {
      const result = await this.userService.create(user);
      return {
        code: 201,
        message: 'User created successfully',
        data: {
          username: result.username,
          email: result.email,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new HttpException(
          {
            code: 409,
            message: error.message,
          },
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(
        {
          code: 500,
          message: 'server error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.userService.remove(id);
  }
}
