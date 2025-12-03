import { UserModel } from "../../../schemas/user.schema";

export class UserProfileDto {
  id: string;
  email: string;
  profileImageUrl: string;
  bedtime: string;
  wakeupTime: string;
  useMelatonin: boolean;
  useCoffee: boolean;
  chronotype: string;

  constructor(user: UserModel) {
    this.id = user.id;
    this.email = user.email;
    this.profileImageUrl = user.profileImage ?? '';
    this.bedtime = user.bedtime ?? '22:00';
    this.wakeupTime = user.wakeupTime ?? '06:00';
    this.useMelatonin = user.useMelatonin ?? false;
    this.useCoffee = user.useCoffee ?? false;
    this.chronotype = user.chronotype ?? 'intermediate';
  }
}