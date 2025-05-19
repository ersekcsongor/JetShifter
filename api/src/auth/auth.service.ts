import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserModel } from 'src/schemas/user.schema';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserModel.name) private userModel: Model<UserModel>,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<{ access_token: string }> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      access_token: await this.jwtService.signAsync({
        email: user.email,
        sub: user.id
      }),
    };
  }

  async register(email: string, password: string): Promise<{ access_token: string }> {
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.userModel.create({
      email,
      hashedPassword,
      createdAt: new Date(),
    });

    return {
      access_token: await this.jwtService.signAsync({
        email: newUser.email,
        sub: newUser.id
      }),
    };
  }
}