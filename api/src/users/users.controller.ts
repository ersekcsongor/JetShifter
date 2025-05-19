import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from 'src/auth/dto/input/create-user.dto';
import { UserResponseDto } from './dto/output/user-response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
 
  @Get('by-email')
  async findByEmail(
    @Query('email') email: string
  ): Promise<UserResponseDto | null> {
    return this.usersService.findByEmail(email);
  }
}