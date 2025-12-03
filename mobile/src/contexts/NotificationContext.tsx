// contexts/NotificationContext.tsx
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import {
  initializeFirebaseMessaging,
  onForegroundMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
} from '~/services/firebaseNotificationService';
import axios from 'axios';
import ENV from '~/utils/constants';
import { useAuth } from './AuthContext';

type NotificationContextType = {
  notification: any | undefined;
  permissionsGranted: boolean;
  fcmToken: string | null;
};

const NotificationContext = createContext<NotificationContextType>({
  notification: undefined,
  permissionsGranted: false,
  fcmToken: null,
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<any | undefined>();
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const { authState } = useAuth();

  useEffect(() => {
    // Initialize Firebase Cloud Messaging
    initializeFirebaseMessaging()
      .then(async (token) => {
        if (token) {
          setFcmToken(token);
          setPermissionsGranted(true);
          console.log('✅ Firebase notifications initialized!');
          console.log('FCM Token:', token);

          // Register token with backend if user is logged in
          if (authState?.user?.email && authState?.token) {
            try {
              await axios.patch(`${ENV.API_BASE_URL}/users/register-push-token`,
                { pushToken: token },
                {
                  headers: {
                    Authorization: `Bearer ${authState.token}`
                  }
                }
              );
              console.log('✅ FCM token registered with backend');
            } catch (error) {
              console.error('❌ Failed to register FCM token with backend:', error);
            }
          }
        } else {
          console.log('⚠️ Firebase notifications not available');
        }
      })
      .catch((error) => {
        console.error('Failed to initialize Firebase messaging:', error);
      });

    // Listen for foreground Firebase notifications
    const unsubscribeForeground = onForegroundMessage((message) => {
      console.log('Firebase foreground message:', message);
      setNotification(message);
    });

    // Listen for notification opened (user tapped)
    onNotificationOpenedApp((message) => {
      console.log('Notification opened:', message);
      // Handle navigation based on notification data
      if (message.data?.flightNumber) {
        console.log('Navigate to flight:', message.data.flightNumber);
      }
    });

    // Listen for token refresh
    const unsubscribeTokenRefresh = onTokenRefresh(async (newToken) => {
      setFcmToken(newToken);
      console.log('FCM Token refreshed:', newToken);

      // Update token on backend
      if (authState?.user?.email && authState?.token) {
        try {
          await axios.patch(`${ENV.API_BASE_URL}/users/register-push-token`,
            { pushToken: newToken },
            {
              headers: {
                Authorization: `Bearer ${authState.token}`
              }
            }
          );
          console.log('✅ Updated FCM token on backend');
        } catch (error) {
          console.error('❌ Failed to update FCM token:', error);
        }
      }
    });

    // Listener for local notifications
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Local notification received:', notification);
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Local notification response:', response);
      const data = response.notification.request.content.data;
      if (data?.flightNumber) {
        console.log('Navigate to flight:', data.flightNumber);
      }
    });

    return () => {
      unsubscribeForeground();
      unsubscribeTokenRefresh();
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [authState?.user?.email]);

  return (
    <NotificationContext.Provider value={{ notification, permissionsGranted, fcmToken }}>
      {children}
    </NotificationContext.Provider>
  );
};
