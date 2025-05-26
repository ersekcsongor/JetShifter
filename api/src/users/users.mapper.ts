import { Injectable } from '@nestjs/common';
import { UserModel } from 'src/schemas/user.schema';
import { UserProfileDto } from './dto/output/user-profile.dto';

@Injectable()
export class UserMapper {
  toUserProfileDto(user: UserModel): UserProfileDto {
    return new UserProfileDto(user);
  }
}
