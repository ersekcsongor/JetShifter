# 🔔 Notification Scheduling Guide

## Overview

JetShifter now supports **scheduled notifications** for your jet lag adjustment schedule! You'll receive timely reminders for light exposure and dark periods to help you adjust to your destination timezone.

## Features

### ✅ What's Implemented

1. **Firebase Push Notifications** - Server-side push notifications via Firebase Cloud Messaging
2. **Local Notification Scheduling** - Device-side scheduled reminders that work offline
3. **Flight Schedule Notifications** - Automatic reminders for:
   - ☀️ Light exposure times
   - 🌙 Dark/avoid light periods
   - ⏰ 15-minute advance warnings
4. **Test Buttons** - Test local and Firebase push notifications in User Profile

## How to Use

### 1. Calculate Your Flight Schedule

1. Open a flight in the app
2. Tap **"Calculate Schedule"**
3. Wait for the optimization to complete
4. View your personalized light/dark schedule

### 2. Schedule Notifications

After calculating your schedule:

1. Scroll to the bottom of the results
2. Tap **"🔔 Schedule Notifications"**
3. Confirm you want to schedule notifications
4. You'll see: `Scheduled X notifications for your jet lag schedule`

### 3. Receive Notifications

You'll automatically receive notifications at:

- **Light exposure times**: `☀️ Light Exposure Time - Get bright light exposure now to help adjust your circadian rhythm`
- **Dark periods**: `🌙 Avoid Light - Avoid bright light now. Wear sunglasses or stay in dim lighting`
- **15-minute warnings**: `⏰ Upcoming Schedule Change - In 15 minutes: Get bright light`

### 4. Cancel Notifications

To cancel all scheduled notifications:

1. Return to the flight details screen
2. Tap **"🔕 Cancel Notifications"**
3. All scheduled notifications will be cleared

## Technical Details

### File Structure

```
mobile/src/
├── services/
│   ├── notificationService.ts              # Basic local notifications
│   ├── firebaseNotificationService.ts      # Firebase messaging integration
│   └── scheduleNotificationService.ts      # Schedule management (NEW)
├── contexts/
│   └── NotificationContext.tsx             # Notification permissions & FCM token
└── screens/
    ├── FlightDetailsScreen.tsx             # Added scheduling buttons
    ├── FlightDetailsScreenCustom.tsx       # TODO: Add scheduling
    └── UserDetailsScreen.tsx               # Test notification buttons
```

### Backend Structure

```
api/src/
├── notifications/
│   ├── notifications.module.ts             # Module configuration
│   ├── notifications.controller.ts         # API endpoints
│   ├── notifications.service.ts            # Expo push (legacy)
│   └── firebase-notifications.service.ts   # Firebase FCM (active)
└── main.ts                                 # Firebase Admin SDK initialization
```

### API Endpoints

#### Send Push Notification
```
POST /notifications/send
Authorization: Bearer <JWT_TOKEN>

Body:
{
  "email": "user@example.com",
  "title": "Notification Title",
  "body": "Notification body text",
  "data": { "key": "value" }
}
```

#### Send Flight Reminder
```
POST /notifications/flight-reminder
Authorization: Bearer <JWT_TOKEN>

Body:
{
  "email": "user@example.com",
  "flightNumber": "AA123",
  "departureTime": "2025-12-15T10:00:00Z"
}
```

#### Send Intervention Reminder (Melatonin/Coffee)
```
POST /notifications/intervention-reminder
Authorization: Bearer <JWT_TOKEN>

Body:
{
  "email": "user@example.com",
  "interventionType": "melatonin",  // or "coffee"
  "scheduledTime": "2025-12-15T22:00:00Z"
}
```

## Notification Types

### 1. Local Notifications

**How they work:**
- Scheduled on the device
- Work offline (no internet required)
- Triggered by device clock
- Perfect for predictable schedule reminders

**When to use:**
- Flight schedule reminders (light/dark periods)
- Pre-scheduled interventions (melatonin/coffee)
- Any time-based reminder

### 2. Firebase Push Notifications

**How they work:**
- Sent from server via Firebase Cloud Messaging
- Require internet connection
- Can be triggered by server events
- More flexible and dynamic

**When to use:**
- Real-time alerts
- Server-triggered notifications
- Flight status changes
- Emergency updates

## Example: Scheduling Flow

```typescript
// 1. Calculate flight schedule
const switchingTimes = calculateSwitchingTimes(flight, timezones, sleepSchedule);

// 2. Schedule notifications for all switching points
const scheduled = await scheduleFlightScheduleNotifications(
  switchingTimes,
  flight.flightNumber
);

// Result:
// - Main notification at each switching time
// - 15-minute advance warning before each switch
// - All future notifications scheduled
// - Past times automatically skipped

console.log(`Scheduled ${scheduled.length} notifications`);
```

## Notification Data Structure

```typescript
type NotificationSchedule = {
  id: string;              // Unique notification ID
  time: Date;              // When to trigger
  title: string;           // Notification title
  body: string;            // Notification body
  data: {
    flightNumber: string;
    switchingPointIndex?: number;
    type: 'light' | 'dark' | 'reminder';
    timestamp: string;
  };
};
```

## Testing Notifications

### Test Local Notifications

1. Go to **User Profile**
2. Tap **"Test Local Notification"**
3. Wait 5 seconds
4. Notification appears!

### Test Firebase Push Notifications

1. Go to **User Profile**
2. Tap **"Test Firebase Push"**
3. Server sends notification via Firebase
4. Notification appears immediately!

## Troubleshooting

### Notifications Not Appearing

**Check permissions:**
```typescript
const { permissionsGranted } = useNotifications();
console.log('Permissions:', permissionsGranted);
```

**Check scheduled notifications:**
```typescript
import { getAllScheduledNotifications } from '~/services/scheduleNotificationService';

const scheduled = await getAllScheduledNotifications();
console.log(`${scheduled.length} notifications scheduled`);
```

### Firebase Push Not Working

**Check FCM token:**
```typescript
const { fcmToken } = useNotifications();
console.log('FCM Token:', fcmToken);
```

**Check backend logs:**
```
✅ Firebase Admin SDK initialized
✅ FCM token registered with backend
FCM notification sent successfully: <message-id>
```

**Common issues:**
- Firebase service account file missing: `api/jetshifter-dcf02-firebase-adminsdk-*.json`
- Backend not running on correct IP
- Device not connected to internet
- FCM token not registered (user not logged in)

## Future Enhancements

### Planned Features

1. **Smart Notification Timing** - Adjust notification timing based on user behavior
2. **Intervention Reminders** - Scheduled reminders for melatonin/coffee
3. **Notification Customization** - Let users choose which notifications to receive
4. **Snooze Functionality** - Allow users to snooze reminders
5. **Progress Tracking** - Show completion status in notifications
6. **Multi-Flight Support** - Manage notifications for multiple saved flights
7. **Notification History** - View past notifications and actions taken

### Integration Ideas

- **Wearable Integration** - Send notifications to Apple Watch/Android Wear
- **Calendar Integration** - Add schedule to device calendar
- **Smart Home Integration** - Control smart lights based on schedule
- **Travel Integration** - Sync with flight booking apps

## Development Notes

### Adding New Notification Types

```typescript
// 1. Create notification scheduler function
export async function scheduleCustomNotification(
  time: Date,
  title: string,
  body: string
): Promise<string> {
  return await scheduleNotificationAtTime(time, title, body, {
    type: 'custom',
    timestamp: time.toISOString()
  });
}

// 2. Add to UI
const handleScheduleCustom = async () => {
  await scheduleCustomNotification(
    new Date(Date.now() + 10000),
    'Custom Notification',
    'This is a custom notification'
  );
};
```

### Firebase Admin SDK Setup

1. **Get Firebase credentials:**
   - Go to Firebase Console → Project Settings
   - Service Accounts → Generate New Private Key
   - Save as `api/jetshifter-dcf02-firebase-adminsdk-*.json`

2. **Initialize in backend:**
```typescript
// api/src/main.ts
import * as admin from 'firebase-admin';

const serviceAccount = require('../jetshifter-dcf02-firebase-adminsdk-*.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
```

3. **Register FCM token:**
```typescript
// Mobile app - NotificationContext.tsx
const token = await getFirebaseFCMToken();
await axios.patch('/users/register-push-token',
  { pushToken: token },
  { headers: { Authorization: `Bearer ${jwtToken}` }}
);
```

## Summary

✅ **Firebase push notifications** - Working!
✅ **Local notification scheduling** - Implemented!
✅ **Flight schedule notifications** - Ready to use!
✅ **Test buttons** - Available in User Profile!

Your jet lag adjustment schedule is now backed by timely notifications to help you stay on track! 🎉

---

*Last Updated: December 2, 2025*
