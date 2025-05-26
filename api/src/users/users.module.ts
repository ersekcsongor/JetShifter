import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserModel, UserSchema } from '../schemas/user.schema';
import { SharedModule } from 'src/shared/shared.module';
import { UserMapper } from './users.mapper';

@Module({
  imports: [SharedModule],
  controllers: [UsersController],
  providers: [UsersService,UserMapper],
})
export class UsersModule {}
