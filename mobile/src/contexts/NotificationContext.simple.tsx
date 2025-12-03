// contexts/NotificationContext.tsx - SIMPLE VERSION (Works in Expo Go)
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { requestNotificationPermissions } from '~/services/notificationService';

type NotificationContextType = {
  notification: Notifications.Notification | undefined;
  permissionsGranted: boolean;
};

const NotificationContext = createContext<NotificationContextType>({
  notification: undefined,
  permissionsGranted: false,
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Request local notification permissions (works in Expo Go!)
    requestNotificationPermissions()
      .then((granted) => {
        setPermissionsGranted(granted);
        if (granted) {
          console.log('✅ Local notifications enabled!');
        }
      })
      .catch((error) => {
        console.error('Failed to request notification permissions:', error);
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
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notification, permissionsGranted }}>
      {children}
    </NotificationContext.Provider>
  );
};
