// services/notificationService.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions (works in Expo Go!)
 * For local notifications only - no push tokens needed
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    // Android: Set notification channel (required for Android 8.0+)
    await Notifications.setNotificationChannelAsync('default', {
      name: 'JetShifter Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // Check if we have permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Ask for permission if we don't have it
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Notification permissions not granted');
    return false;
  }

  console.log('Notification permissions granted!');
  return true;
}

/**
 * DEPRECATED: Push tokens only work in development builds, not Expo Go
 * Use local notifications instead for Expo Go compatibility
 */
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  console.warn('Push notifications require a development build. Use local notifications instead.');
  return undefined;
}

/**
 * Schedule a local notification (doesn't require server)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  triggerSeconds: number = 5
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: triggerSeconds,
      repeats: false,
    },
  });
}

/**
 * Schedule notification for flight reminder
 */
export async function scheduleFlightReminder(
  flightNumber: string,
  departureTime: Date,
  hoursBeforeFlight: number = 24
) {
  const triggerTime = new Date(departureTime.getTime() - hoursBeforeFlight * 60 * 60 * 1000);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Upcoming Flight: ${flightNumber}`,
      body: `Your flight departs in ${hoursBeforeFlight} hours. Check your jet lag schedule!`,
      sound: true,
      data: { flightNumber },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerTime,
    },
  });
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}
