import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserModel } from '../schemas/user.schema';
import { UserMapper } from './users.mapper';
import { UserProfileDto } from './dto/output/user-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserModel.name) private userModel: Model<UserModel>,
    private readonly userMapper: UserMapper,
  ) {}

  async findByEmail(email: string): Promise<UserProfileDto | null> {
    const user = await this.userModel.findOne({ email }).exec();
    return user ? this.userMapper.toUserProfileDto(user) : null;
  }

  async findById(id: string): Promise<UserProfileDto | null> {
    const user = await this.userModel.findById(id).exec();
    return user ? this.userMapper.toUserProfileDto(user) : null;
  }
}
