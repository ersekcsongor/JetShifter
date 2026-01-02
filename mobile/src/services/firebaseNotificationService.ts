// services/firebaseNotificationService.ts
import {
  getMessaging,
  requestPermission,
  getToken,
  onTokenRefresh,
  onMessage,
  setBackgroundMessageHandler,
  onNotificationOpenedApp,
  getInitialNotification,
  subscribeToTopic,
  unsubscribeFromTopic,
  AuthorizationStatus,
  type FirebaseMessagingTypes
} from '@react-native-firebase/messaging';
import { Alert } from 'react-native';
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
    const messaging = getMessaging();
    const authStatus = await requestPermission(messaging);
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

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
    const messaging = getMessaging();
    const fcmToken = await getToken(messaging);
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
export function onTokenRefreshListener(callback: (token: string) => void) {
  const messaging = getMessaging();
  return onTokenRefresh(messaging, (token: string) => {
    console.log('FCM Token refreshed:', token);
    callback(token);
  });
}

/**
 * Handle foreground notifications (when app is open)
 */
export function onForegroundMessage(callback: (message: FirebaseMessagingTypes.RemoteMessage) => void) {
  const messaging = getMessaging();
  return onMessage(messaging, async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
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
  const messaging = getMessaging();
  setBackgroundMessageHandler(messaging, async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
    console.log('Background notification received:', remoteMessage);
    return Promise.resolve();
  });
}

/**
 * Handle notification opened (user tapped notification)
 */
export function onNotificationOpenedAppListener(callback: (message: FirebaseMessagingTypes.RemoteMessage) => void) {
  const messaging = getMessaging();

  // App opened from background state
  onNotificationOpenedApp(messaging, (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
    console.log('Notification opened app from background:', remoteMessage);
    callback(remoteMessage);
  });

  // App opened from quit state
  getInitialNotification(messaging)
    .then((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
      if (remoteMessage) {
        console.log('Notification opened app from quit state:', remoteMessage);
        callback(remoteMessage);
      }
    });
}

/**
 * Subscribe to a topic for targeted notifications
 */
export async function subscribeToFirebaseTopic(topic: string): Promise<void> {
  try {
    const messaging = getMessaging();
    await subscribeToTopic(messaging, topic);
    console.log(`Subscribed to topic: ${topic}`);
  } catch (error) {
    console.error(`Error subscribing to topic ${topic}:`, error);
  }
}

/**
 * Unsubscribe from a topic
 */
export async function unsubscribeFromFirebaseTopic(topic: string): Promise<void> {
  try {
    const messaging = getMessaging();
    await unsubscribeFromTopic(messaging, topic);
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
