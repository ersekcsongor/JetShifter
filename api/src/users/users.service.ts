import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserModel } from '../schemas/user.schema';
import { UserMapper } from './users.mapper';
import { UserProfileDto } from './dto/output/user-profile.dto';
import { ChangePasswordDto } from './dto/input/change-password.dto';
import * as bcrypt from 'bcrypt';

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

  async changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const user = await this.userModel.findById(userId).select('+hashedPassword').exec();
  
  if (!user) {
    throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  }

  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.hashedPassword);
  if (!isMatch) {
    throw new HttpException('Invalid current password', HttpStatus.UNAUTHORIZED);
  }

  // Hash and update new password
  const saltRounds = 10;
  user.hashedPassword = await bcrypt.hash(newPassword, saltRounds);
  await user.save();
}


}
