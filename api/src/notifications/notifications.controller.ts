// notifications.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { FirebaseNotificationsService } from './firebase-notifications.service';
import { JwtGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly firebaseNotificationsService: FirebaseNotificationsService) {}

  @UseGuards(JwtGuard)
  @Post('send')
  async sendNotification(
    @Body() body: {
      email: string;
      title: string;
      body: string;
      data?: Record<string, any>;
    },
  ) {
    await this.firebaseNotificationsService.sendNotificationToUser(
      body.email,
      body.title,
      body.body,
      body.data,
    );
    return { message: 'Notification sent successfully' };
  }

  @UseGuards(JwtGuard)
  @Post('flight-reminder')
  async sendFlightReminder(
    @Body() body: {
      email: string;
      flightNumber: string;
      departureTime: string;
    },
  ) {
    await this.firebaseNotificationsService.sendFlightReminder(
      body.email,
      body.flightNumber,
      new Date(body.departureTime),
    );
    return { message: 'Flight reminder sent successfully' };
  }

  @UseGuards(JwtGuard)
  @Post('intervention-reminder')
  async sendInterventionReminder(
    @Body() body: {
      email: string;
      interventionType: 'melatonin' | 'coffee';
      scheduledTime: string;
    },
  ) {
    await this.firebaseNotificationsService.sendInterventionReminder(
      body.email,
      body.interventionType,
      new Date(body.scheduledTime),
    );
    return { message: 'Intervention reminder sent successfully' };
  }
}
