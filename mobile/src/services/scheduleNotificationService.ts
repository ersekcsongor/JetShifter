// services/scheduleNotificationService.ts
import * as Notifications from 'expo-notifications';
import { SwitchingTimes } from '~/utils/types';
import { scheduleFlightReminder } from './notificationService';

export type NotificationSchedule = {
  id: string;
  time: Date;
  title: string;
  body: string;
  data: Record<string, any>;
};

/**
 * Schedule notifications for all switching points in the flight schedule
 */
export async function scheduleFlightScheduleNotifications(
  switchingTimes: SwitchingTimes,
  flightNumber: string
): Promise<NotificationSchedule[]> {
  const scheduledNotifications: NotificationSchedule[] = [];

  // Cancel any existing scheduled notifications first
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Schedule notification for each switching point
  for (let i = 0; i < switchingTimes.switchingPoints.length; i++) {
    const point = switchingTimes.switchingPoints[i];
    const switchTime = new Date(point.time);
    const now = new Date();

    // Only schedule future notifications
    if (switchTime > now) {
      const isLightExposure = point.type === 'light';

      // Schedule main notification at switching time
      const notificationId = await scheduleNotificationAtTime(
        switchTime,
        isLightExposure ? '☀️ Light Exposure Time' : '🌙 Avoid Light',
        isLightExposure
          ? 'Get bright light exposure now to help adjust your circadian rhythm'
          : 'Avoid bright light now. Wear sunglasses or stay in dim lighting',
        {
          flightNumber,
          switchingPointIndex: i,
          type: point.type,
          timestamp: point.time,
        }
      );

      scheduledNotifications.push({
        id: notificationId,
        time: switchTime,
        title: isLightExposure ? '☀️ Light Exposure Time' : '🌙 Avoid Light',
        body: isLightExposure
          ? 'Get bright light exposure now'
          : 'Avoid bright light now',
        data: { flightNumber, type: point.type },
      });

      // Schedule reminder 15 minutes before
      const reminderTime = new Date(switchTime.getTime() - 15 * 60 * 1000);
      if (reminderTime > now) {
        const reminderId = await scheduleNotificationAtTime(
          reminderTime,
          '⏰ Upcoming Schedule Change',
          `In 15 minutes: ${isLightExposure ? 'Get bright light' : 'Avoid bright light'}`,
          {
            flightNumber,
            switchingPointIndex: i,
            type: 'reminder',
            upcomingType: point.type,
            timestamp: reminderTime.toISOString(),
          }
        );

        scheduledNotifications.push({
          id: reminderId,
          time: reminderTime,
          title: '⏰ Upcoming Schedule Change',
          body: `In 15 minutes: ${isLightExposure ? 'Get bright light' : 'Avoid bright light'}`,
          data: { flightNumber, type: 'reminder' },
        });
      }
    }
  }

  console.log(`✅ Scheduled ${scheduledNotifications.length} notifications for flight ${flightNumber}`);
  return scheduledNotifications;
}

/**
 * Schedule a notification at a specific time
 */
async function scheduleNotificationAtTime(
  time: Date,
  title: string,
  body: string,
  data: Record<string, any>
): Promise<string> {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      data,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: time,
    },
  });

  return notificationId;
}

/**
 * Schedule intervention reminders (melatonin/coffee) based on pharmacology calculations
 */
export async function scheduleInterventionNotifications(
  interventions: Array<{
    type: 'melatonin' | 'coffee';
    time: Date;
    doseMg: number;
  }>,
  flightNumber: string
): Promise<NotificationSchedule[]> {
  const scheduledNotifications: NotificationSchedule[] = [];
  const now = new Date();

  for (const intervention of interventions) {
    if (intervention.time > now) {
      const isMelatonin = intervention.type === 'melatonin';
      const title = isMelatonin ? '💊 Time for Melatonin' : '☕ Time for Caffeine';
      const body = isMelatonin
        ? `Take ${intervention.doseMg}mg melatonin to help adjust your circadian rhythm`
        : `Have your coffee (${intervention.doseMg}mg caffeine) to maintain alertness`;

      const notificationId = await scheduleNotificationAtTime(
        intervention.time,
        title,
        body,
        {
          flightNumber,
          interventionType: intervention.type,
          doseMg: intervention.doseMg,
          timestamp: intervention.time.toISOString(),
        }
      );

      scheduledNotifications.push({
        id: notificationId,
        time: intervention.time,
        title,
        body,
        data: { flightNumber, interventionType: intervention.type },
      });

      // Schedule reminder 30 minutes before
      const reminderTime = new Date(intervention.time.getTime() - 30 * 60 * 1000);
      if (reminderTime > now) {
        const reminderId = await scheduleNotificationAtTime(
          reminderTime,
          '⏰ Upcoming Intervention',
          `In 30 minutes: ${isMelatonin ? 'Take melatonin' : 'Have coffee'}`,
          {
            flightNumber,
            interventionType: intervention.type,
            type: 'reminder',
            timestamp: reminderTime.toISOString(),
          }
        );

        scheduledNotifications.push({
          id: reminderId,
          time: reminderTime,
          title: '⏰ Upcoming Intervention',
          body: `In 30 minutes: ${isMelatonin ? 'Take melatonin' : 'Have coffee'}`,
          data: { flightNumber, type: 'reminder' },
        });
      }
    }
  }

  console.log(`✅ Scheduled ${scheduledNotifications.length} intervention notifications`);
  return scheduledNotifications;
}

/**
 * Schedule flight departure reminder
 */
export async function scheduleFlightDepartureReminder(
  flightNumber: string,
  departureTime: Date
): Promise<string> {
  const now = new Date();

  // Schedule 24 hours before flight
  const reminderTime = new Date(departureTime.getTime() - 24 * 60 * 60 * 1000);

  if (reminderTime > now) {
    return await scheduleFlightReminder(flightNumber, departureTime, 24);
  }

  return '';
}

/**
 * Get all currently scheduled notifications
 */
export async function getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('✅ All scheduled notifications cancelled');
}

/**
 * Cancel specific notification by ID
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
