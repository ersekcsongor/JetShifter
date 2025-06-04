import { UserModel } from 'src/schemas/user.schema';

export class UserProfileDto {
  id: string;
  email: string;
  profileImageUrl: string;

  constructor(user: UserModel) {
    this.id = user.id;
    this.email = user.email;
    this.profileImageUrl = user.profileImage ?? '';
  }
}