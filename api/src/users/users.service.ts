import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // Create a new user
  async create(name: string, email: string, password: string): Promise<User> {
    const newUser = new this.userModel({ name, email, password });
    return newUser.save();
  }

  // Fetch all users
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}
