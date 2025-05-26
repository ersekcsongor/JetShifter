// src/auth/auth.controller.ts
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AccessTokenDto } from './dto/output/access-token.dto';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/input/login-request.dto';
import { CreateUserDto } from './dto/input/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginRequestDto): Promise<AccessTokenDto> {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() registerDto: CreateUserDto): Promise<AccessTokenDto> {
    return this.authService.register(registerDto);
  }
}