import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
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
  async create(@Body() user: CreateUserDto): Promise<User> {
    return await this.userService.create(user);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.userService.remove(id);
  }
}
