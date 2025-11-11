import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserModel, UserSchema } from '../schemas/user.schema';
import { UserMapper } from './users.mapper';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [UsersController],
  providers: [UsersService,UserMapper],
})
export class UsersModule {}
