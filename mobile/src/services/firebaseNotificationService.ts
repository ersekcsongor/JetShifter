// services/firebaseNotificationService.ts
import messaging from '@react-native-firebase/messaging';
import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';

// Configure how notifications are displayed
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
 * Request notification permissions for Firebase
 */
export async function requestFirebasePermissions(): Promise<boolean> {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('✅ Firebase notification permissions granted');
      return true;
    } else {
      console.log('❌ Firebase notification permissions denied');
      return false;
    }
  } catch (error) {
    console.error('Error requesting Firebase permissions:', error);
    return false;
  }
}

/**
 * Get Firebase Cloud Messaging (FCM) token
 */
export async function getFirebaseFCMToken(): Promise<string | null> {
  try {
    // Request permission first
    const hasPermission = await requestFirebasePermissions();
    if (!hasPermission) {
      return null;
    }

    // Get FCM token
    const fcmToken = await messaging().getToken();
    console.log('FCM Token:', fcmToken);
    return fcmToken;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

/**
 * Listen for FCM token refresh
 */
export function onTokenRefresh(callback: (token: string) => void) {
  return messaging().onTokenRefresh((token) => {
    console.log('FCM Token refreshed:', token);
    callback(token);
  });
}

/**
 * Handle foreground notifications (when app is open)
 */
export function onForegroundMessage(callback: (message: any) => void) {
  return messaging().onMessage(async (remoteMessage) => {
    console.log('Foreground notification received:', remoteMessage);

    // Display notification using expo-notifications
    if (remoteMessage.notification) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: remoteMessage.notification.title || 'JetShifter',
          body: remoteMessage.notification.body || '',
          data: remoteMessage.data || {},
        },
        trigger: null, // Show immediately
      });
    }

    callback(remoteMessage);
  });
}

/**
 * Handle background/quit state notifications
 */
export function onBackgroundMessage() {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('Background notification received:', remoteMessage);
    return Promise.resolve();
  });
}

/**
 * Handle notification opened (user tapped notification)
 */
export function onNotificationOpenedApp(callback: (message: any) => void) {
  // App opened from background state
  messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log('Notification opened app from background:', remoteMessage);
    callback(remoteMessage);
  });

  // App opened from quit state
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        console.log('Notification opened app from quit state:', remoteMessage);
        callback(remoteMessage);
      }
    });
}

/**
 * Subscribe to a topic for targeted notifications
 */
export async function subscribeToTopic(topic: string): Promise<void> {
  try {
    await messaging().subscribeToTopic(topic);
    console.log(`Subscribed to topic: ${topic}`);
  } catch (error) {
    console.error(`Error subscribing to topic ${topic}:`, error);
  }
}

/**
 * Unsubscribe from a topic
 */
export async function unsubscribeFromTopic(topic: string): Promise<void> {
  try {
    await messaging().unsubscribeFromTopic(topic);
    console.log(`Unsubscribed from topic: ${topic}`);
  } catch (error) {
    console.error(`Error unsubscribing from topic ${topic}:`, error);
  }
}

/**
 * Schedule local notification (still useful for scheduled reminders)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  triggerSeconds: number = 5
): Promise<void> {
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
 * Initialize Firebase Messaging
 */
export async function initializeFirebaseMessaging(): Promise<string | null> {
  try {
    // Request permissions
    const hasPermission = await requestFirebasePermissions();
    if (!hasPermission) {
      Alert.alert(
        'Notifications Disabled',
        'Please enable notifications in your device settings to receive flight updates.'
      );
      return null;
    }

    // Get FCM token
    const fcmToken = await getFirebaseFCMToken();

    // Set up background message handler
    onBackgroundMessage();

    return fcmToken;
  } catch (error) {
    console.error('Error initializing Firebase messaging:', error);
    return null;
  }
}
