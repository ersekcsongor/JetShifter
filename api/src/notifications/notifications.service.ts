// notifications.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserModel } from '../schemas/user.schema';
import Expo, { ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

@Injectable()
export class NotificationsService {
  private expo: Expo;

  constructor(
    @InjectModel(UserModel.name) private userModel: Model<UserModel>,
  ) {
    this.expo = new Expo();
  }

  /**
   * Send push notification to a specific user
   */
  async sendNotificationToUser(
    email: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<void> {
    const user = await this.userModel.findOne({ email });

    if (!user || !user.expoPushToken) {
      console.log(`No push token found for user: ${email}`);
      return;
    }

    await this.sendPushNotification(user.expoPushToken, title, body, data);
  }

  /**
   * Send flight reminder to user
   */
  async sendFlightReminder(
    email: string,
    flightNumber: string,
    departureTime: Date,
  ): Promise<void> {
    const hoursUntilFlight = Math.floor((departureTime.getTime() - Date.now()) / (1000 * 60 * 60));

    await this.sendNotificationToUser(
      email,
      `Upcoming Flight: ${flightNumber}`,
      `Your flight departs in ${hoursUntilFlight} hours. Check your jet lag schedule!`,
      { flightNumber, type: 'flight_reminder' },
    );
  }

  /**
   * Send intervention reminder (melatonin/coffee)
   */
  async sendInterventionReminder(
    email: string,
    interventionType: 'melatonin' | 'coffee',
    scheduledTime: Date,
  ): Promise<void> {
    const title = interventionType === 'melatonin'
      ? '💊 Time for Melatonin'
      : '☕ Time for Caffeine';

    const body = interventionType === 'melatonin'
      ? 'Take your melatonin supplement to help adjust your circadian rhythm'
      : 'Have your coffee now to help maintain alertness during your adjustment period';

    await this.sendNotificationToUser(
      email,
      title,
      body,
      { type: 'intervention', interventionType, scheduledTime },
    );
  }

  /**
   * Core function to send push notification via Expo
   */
  private async sendPushNotification(
    pushToken: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<void> {
    // Check that the token is valid Expo push token
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      return;
    }

    const message: ExpoPushMessage = {
      to: pushToken,
      sound: 'default',
      title,
      body,
      data: data || {},
      priority: 'high',
    };

    try {
      const ticketChunk = await this.expo.sendPushNotificationsAsync([message]);
      console.log('Push notification sent:', ticketChunk);

      // Check for errors
      ticketChunk.forEach((ticket) => {
        if (ticket.status === 'error') {
          console.error('Error sending push notification:', ticket.message);
        }
      });
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  /**
   * Send bulk notifications to multiple users
   */
  async sendBulkNotifications(
    emails: string[],
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<void> {
    const users = await this.userModel.find({
      email: { $in: emails },
      expoPushToken: { $exists: true, $ne: '' },
    });

    const messages: ExpoPushMessage[] = users
      .filter((user) => user.expoPushToken && Expo.isExpoPushToken(user.expoPushToken))
      .map((user) => ({
        to: user.expoPushToken!,
        sound: 'default',
        title,
        body,
        data: data || {},
        priority: 'high',
      }));

    // Split into chunks of 100 (Expo's limit)
    const chunks = this.expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      try {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        console.log('Bulk push notifications sent:', ticketChunk.length);
      } catch (error) {
        console.error('Error sending bulk push notifications:', error);
      }
    }
  }
}
