import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserModel } from 'src/schemas/user.schema';
import { LoginRequestDto } from './dto/input/login-request.dto';
import { AccessTokenDto } from './dto/output/access-token.dto';
import { CreateUserDto } from './dto/input/create-user.dto';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserModel.name) private userModel: Model<UserModel>,
    private jwtService: JwtService,
  ) {}

   async login(loginDto: LoginRequestDto): Promise<AccessTokenDto> {
    const user = await this.userModel.findOne({ email: loginDto.email }).exec();
    
    if (!user || !(await bcrypt.compare(loginDto.password, user.hashedPassword))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  async register(registerDto: CreateUserDto): Promise<AccessTokenDto> {
    if (await this.userModel.findOne({ email: registerDto.email })) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const newUser = await this.userModel.create({
      email: registerDto.email,
      hashedPassword,
      createdAt: new Date(),
    });

    return this.generateToken(newUser);
  }

  private async generateToken(user: UserModel): Promise<AccessTokenDto> {
    const payload = { 
      email: user.email,
      sub: user._id,
    };

    return {
      access_token: await this.jwtService.signAsync(payload, {
        expiresIn: '1h',
        secret: process.env.JWT_SECRET,
      }),
      token_type: 'Bearer'
    };
  }
}