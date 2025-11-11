import { Injectable } from '@nestjs/common';
import { UserProfileDto } from './dto/output/user-profile.dto';
import { UserModel } from '../schemas/user.schema';

@Injectable()
export class UserMapper {
  toUserProfileDto(user: UserModel): UserProfileDto {
    return new UserProfileDto(user);
  }

  
}
