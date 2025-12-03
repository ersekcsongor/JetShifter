# Push Notifications Setup Guide

## Overview

JetShifter now supports **FREE Android push notifications** using Expo's notification service. iOS notifications require an Apple Developer account ($99/year).

---

## 📱 Features Implemented

1. **Local Notifications**: Schedule notifications directly on device
2. **Remote Notifications**: Send push notifications from backend server
3. **Flight Reminders**: Notify users before their flights
4. **Intervention Reminders**: Alert users when to take melatonin or caffeine
5. **Automatic Token Registration**: Push tokens saved to user profile

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```bash
cd mobile
npx expo install expo-notifications expo-device expo-constants
```

### Step 2: Install Backend Dependencies

```bash
cd api
npm install expo-server-sdk
```

### Step 3: Update App Module

Add the `NotificationsModule` to your main app module:

**File**: `api/src/app.module.ts`

```typescript
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    // ... other modules
    NotificationsModule,
  ],
})
export class AppModule {}
```

### Step 4: Wrap App with Notification Provider

**File**: `mobile/App.tsx` (or your root component)

```typescript
import { NotificationProvider } from './src/contexts/NotificationContext';

export default function App() {
  return (
    <NotificationProvider>
      {/* Your existing app components */}
    </NotificationProvider>
  );
}
```

### Step 5: Test Notifications

#### Test Local Notification

```typescript
import { scheduleLocalNotification } from '~/services/notificationService';

// Schedule a test notification in 5 seconds
await scheduleLocalNotification(
  'Test Notification',
  'This is a test notification!',
  5
);
```

#### Test Flight Reminder

```typescript
import { scheduleFlightReminder } from '~/services/notificationService';

// Schedule flight reminder 24 hours before departure
await scheduleFlightReminder(
  'BA123',
  new Date('2025-12-01T10:00:00Z'),
  24
);
```

---

## 📋 Usage Examples

### 1. Schedule Flight Reminder When Saving Flight

**File**: `mobile/src/screens/FlightDetailsScreen.tsx`

```typescript
import { scheduleFlightReminder } from '~/services/notificationService';

const handleSaveFlight = async () => {
  try {
    // Save flight to backend
    await axios.post(`${API_URL}/save`, {
      email: userEmail,
      flightNumber: flight.flightNumber
    });

    // Schedule notification 24 hours before departure
    if (flight.departureTime) {
      await scheduleFlightReminder(
        flight.flightNumber,
        new Date(flight.departureTime),
        24
      );
    }

    setIsFlightSaved(true);
    Alert.alert('Success', 'Flight saved and reminder scheduled!');
  } catch (error) {
    Alert.alert('Error', 'Failed to save flight.');
  }
};
```

### 2. Schedule Intervention Reminders

Add this to your results display when showing melatonin/coffee recommendations:

```typescript
import { scheduleLocalNotification } from '~/services/notificationService';
import moment from 'moment';

// When displaying melatonin recommendation
const melatoninTime = sleepStart.clone().subtract(30, 'minutes');
if (melatoninTime.isAfter(moment())) {
  // Schedule notification 15 minutes before
  const triggerTime = melatoninTime.clone().subtract(15, 'minutes');
  const secondsUntilTrigger = triggerTime.diff(moment(), 'seconds');

  if (secondsUntilTrigger > 0) {
    await scheduleLocalNotification(
      '💊 Time for Melatonin',
      'Take your melatonin supplement in 15 minutes',
      secondsUntilTrigger
    );
  }
}

// When displaying coffee recommendation
const coffeeTime = sleepEnd.clone();
if (coffeeTime.isAfter(moment())) {
  const secondsUntilTrigger = coffeeTime.diff(moment(), 'seconds');

  if (secondsUntilTrigger > 0) {
    await scheduleLocalNotification(
      '☕ Time for Caffeine',
      'Have your coffee now to help with alertness',
      secondsUntilTrigger
    );
  }
}
```

### 3. Send Push Notification from Backend

```typescript
// In your backend service
import { NotificationsService } from './notifications/notifications.service';

@Injectable()
export class FlightsService {
  constructor(
    private notificationsService: NotificationsService,
  ) {}

  async remindUsersOfUpcomingFlights() {
    // Find flights departing in 24 hours
    const upcomingFlights = await this.findFlightsDepartingIn24Hours();

    for (const flight of upcomingFlights) {
      await this.notificationsService.sendFlightReminder(
        flight.userEmail,
        flight.flightNumber,
        flight.departureTime,
      );
    }
  }
}
```

---

## 🔧 API Endpoints

### Register Push Token

```http
PATCH /users/register-push-token
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "pushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

### Send Custom Notification

```http
POST /notifications/send
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "email": "user@example.com",
  "title": "Custom Title",
  "body": "Custom message body",
  "data": {
    "type": "custom",
    "customField": "value"
  }
}
```

### Send Flight Reminder

```http
POST /notifications/flight-reminder
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "email": "user@example.com",
  "flightNumber": "BA123",
  "departureTime": "2025-12-01T10:00:00Z"
}
```

### Send Intervention Reminder

```http
POST /notifications/intervention-reminder
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "email": "user@example.com",
  "interventionType": "melatonin",
  "scheduledTime": "2025-11-25T22:00:00Z"
}
```

---

## 🔍 How It Works

### Token Registration Flow

1. App launches → `NotificationContext` initializes
2. Request notification permissions from user
3. Get Expo Push Token from Expo servers
4. Send token to backend → Save in user profile
5. Backend can now send push notifications to this device

### Notification Types

#### Local Notifications
- Scheduled on the device
- Don't require server or internet
- Great for: scheduled reminders, alarms

#### Remote (Push) Notifications
- Sent from server via Expo Push Service
- Require internet connection
- Great for: real-time updates, cross-device sync

---

## 📊 Testing on Physical Device

**Important**: Push notifications only work on **physical devices**, not simulators/emulators.

### Android Testing

1. Build development client:
   ```bash
   npx expo run:android
   ```

2. Grant notification permissions when prompted

3. Check console for Expo Push Token:
   ```
   Expo Push Token: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
   ```

4. Test using Expo's push notification tool:
   https://expo.dev/notifications

---

## 🛠️ Troubleshooting

### "Must use physical device for Push Notifications"
- **Cause**: Running on simulator/emulator
- **Solution**: Test on a real Android device

### Token not registering with backend
- **Cause**: User not logged in or network error
- **Solution**: Check auth token, verify API endpoint

### Notifications not appearing
- **Check**: Device notification settings
- **Check**: App notification permissions
- **Check**: `Notifications.setNotificationHandler()` configuration

### "Push token is not a valid Expo push token"
- **Cause**: Token format incorrect
- **Solution**: Verify token starts with `ExponentPushToken[`

---

## 💰 Cost

- ✅ **Android**: Completely FREE
- ❌ **iOS**: Requires Apple Developer Program ($99/year)

Expo's push notification service is free for both platforms, but iOS requires:
- Apple Developer account
- APNs (Apple Push Notification service) certificate
- Provisioning profiles

---

## 📚 Files Created/Modified

### Mobile App
- ✅ `mobile/src/services/notificationService.ts` - Core notification utilities
- ✅ `mobile/src/contexts/NotificationContext.tsx` - React context for notifications
- ✅ `mobile/app.json` - Updated with notification config

### Backend API
- ✅ `api/src/notifications/notifications.service.ts` - Push notification service
- ✅ `api/src/notifications/notifications.controller.ts` - API endpoints
- ✅ `api/src/notifications/notifications.module.ts` - Module definition
- ✅ `api/src/schemas/user.schema.ts` - Added `expoPushToken` field
- ✅ `api/src/users/users.controller.ts` - Added token registration endpoint

---

## 🎯 Next Steps

1. **Install dependencies** (mobile and backend)
2. **Update app.module.ts** to include NotificationsModule
3. **Wrap app with NotificationProvider**
4. **Test on physical Android device**
5. **Integrate flight/intervention reminders** into your existing flows

---

## 📖 Resources

- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo Push Notification Tool](https://expo.dev/notifications)
- [Expo Server SDK](https://github.com/expo/expo-server-sdk-node)

---

*Implemented: November 25, 2025*
