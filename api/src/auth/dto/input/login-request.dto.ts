import { IsString } from 'class-validator';

export class LoginRequestDto {
  @IsString()
  email: string;

  @IsString()
  password: string;
}