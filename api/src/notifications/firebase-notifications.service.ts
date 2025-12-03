// firebase-notifications.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserModel } from '../schemas/user.schema';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseNotificationsService {
  constructor(
    @InjectModel(UserModel.name) private userModel: Model<UserModel>,
  ) {}

  /**
   * Send push notification to a specific user via Firebase FCM
   */
  async sendNotificationToUser(
    email: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<void> {
    const user = await this.userModel.findOne({ email });

    if (!user || !user.expoPushToken) {
      console.log(`No FCM token found for user: ${email}`);
      return;
    }

    await this.sendFCMNotification(user.expoPushToken, title, body, data);
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
      `✈️ Upcoming Flight: ${flightNumber}`,
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
      { type: 'intervention', interventionType, scheduledTime: scheduledTime.toISOString() },
    );
  }

  /**
   * Core function to send push notification via Firebase FCM
   */
  private async sendFCMNotification(
    fcmToken: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<void> {
    try {
      const message: admin.messaging.Message = {
        token: fcmToken,
        notification: {
          title,
          body,
        },
        data: data ? this.convertDataToStrings(data) : {},
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            priority: 'high',
            channelId: 'default',
          },
        },
      };

      const response = await admin.messaging().send(message);
      console.log('FCM notification sent successfully:', response);
    } catch (error) {
      console.error('Error sending FCM notification:', error);
      if (error.code === 'messaging/registration-token-not-registered') {
        // Token is invalid, remove it from database
        await this.userModel.updateOne(
          { expoPushToken: fcmToken },
          { $set: { expoPushToken: '' } }
        );
        console.log('Removed invalid FCM token from database');
      }
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

    if (users.length === 0) {
      console.log('No users with FCM tokens found');
      return;
    }

    const tokens = users.map(user => user.expoPushToken!);

    try {
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title,
          body,
        },
        data: data ? this.convertDataToStrings(data) : {},
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            priority: 'high',
            channelId: 'default',
          },
        },
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      console.log(`Bulk notifications sent: ${response.successCount} successful, ${response.failureCount} failed`);

      // Handle failed tokens
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
            console.error(`Failed to send to token ${tokens[idx]}:`, resp.error);
          }
        });

        // Remove invalid tokens
        await this.userModel.updateMany(
          { expoPushToken: { $in: failedTokens } },
          { $set: { expoPushToken: '' } }
        );
      }
    } catch (error) {
      console.error('Error sending bulk FCM notifications:', error);
    }
  }

  /**
   * Send notification to a topic (all subscribed users)
   */
  async sendToTopic(
    topic: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<void> {
    try {
      const message: admin.messaging.Message = {
        topic,
        notification: {
          title,
          body,
        },
        data: data ? this.convertDataToStrings(data) : {},
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            priority: 'high',
            channelId: 'default',
          },
        },
      };

      const response = await admin.messaging().send(message);
      console.log('Topic notification sent successfully:', response);
    } catch (error) {
      console.error('Error sending topic notification:', error);
    }
  }

  /**
   * Helper: Convert data object to strings (FCM requirement)
   */
  private convertDataToStrings(data: Record<string, any>): Record<string, string> {
    const stringData: Record<string, string> = {};
    for (const key in data) {
      stringData[key] = typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]);
    }
    return stringData;
  }
}
