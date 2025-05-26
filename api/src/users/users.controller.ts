import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from 'src/auth/dto/input/create-user.dto';
import { UserResponseDto } from './dto/output/user-response.dto';
import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UserModel } from 'src/schemas/user.schema';
import { UserMapper } from './users.mapper';
import { UserProfileDto } from './dto/output/user-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersMapper: UserMapper) {}
 
  @UseGuards(JwtGuard)
  @Get('me')
  async getMe(@CurrentUser() user: UserModel): Promise<UserProfileDto> {
    return this.usersMapper.toUserProfileDto(user);
  }
}