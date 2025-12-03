// notifications.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsService } from './notifications.service';
import { FirebaseNotificationsService } from './firebase-notifications.service';
import { NotificationsController } from './notifications.controller';
import { UserModel, UserSchema } from '../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, FirebaseNotificationsService],
  exports: [NotificationsService, FirebaseNotificationsService],
})
export class NotificationsModule {}
