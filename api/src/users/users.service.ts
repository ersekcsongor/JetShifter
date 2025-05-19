import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { plainToClass } from 'class-transformer';
import { UserModel } from '../schemas/user.schema';
import { CreateUserDto } from 'src/auth/dto/input/create-user.dto';
import { UserResponseDto } from './dto/output/user-response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(UserModel.name) private userModel: Model<UserModel>) {}

  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.userModel.findOne({ email }).lean();
    return user ? plainToClass(UserResponseDto, user, {
      excludeExtraneousValues: true
    }) : null;
  }

}