import { Expose, Exclude } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  createdAt: Date;

  @Exclude()
  hashedPassword: string;
}