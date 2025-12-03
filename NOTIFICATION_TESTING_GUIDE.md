# 🧪 Notification Testing Guide

## ✅ Setup Complete!

All dependencies have been installed and the code is ready to test.

---

## 📱 How to Test on Physical Android Device

### Step 1: Start the Backend Server

```bash
cd api
npm run start:dev
```

Make sure the backend is running and accessible.

### Step 2: Build and Run on Android Device

**Option A: Development Build (Recommended)**
```bash
cd mobile
npx expo run:android
```

**Option B: Expo Go (Limited notification support)**
```bash
cd mobile
npx expo start
```
Then scan QR code with Expo Go app.

⚠️ **Important**: Push notifications only work on **physical devices**, not emulators!

### Step 3: Grant Permissions

When the app launches, you should see a permission request for notifications. **Tap "Allow"**.

### Step 4: Test Local Notifications

1. Open the app and log in
2. Navigate to **User Profile** (tap your profile icon)
3. Scroll down and tap the **"Test Notification"** button
4. You should see an alert saying "Test notification scheduled!"
5. **Wait 5 seconds** - a notification will appear!

### Step 5: Check Push Token Registration

Look at your terminal logs. You should see:
```
Expo Push Token: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
Push token registered with backend
```

---

## 🔍 What to Look For

### ✅ Success Indicators

1. **Permission granted**: System notification dialog appears and you grant permission
2. **Token generated**: Console shows `Expo Push Token: ExponentPushToken[...]`
3. **Token saved**: Backend logs show "Push token registered successfully"
4. **Notification appears**: After tapping "Test Notification", a notification pops up in 5 seconds
5. **Notification tap works**: Tapping the notification opens/focuses the app

### ❌ Troubleshooting

#### "Must use physical device for Push Notifications"
- You're running on an emulator/simulator
- **Solution**: Use a real Android device connected via USB

#### No permission dialog appears
- Permissions might be cached
- **Solution**: Uninstall app and reinstall: `npx expo run:android`

#### Notification doesn't appear
- Check device notification settings
- **Solution**: Go to Settings → Apps → JetShifter → Notifications → Enable

#### "Push token is not a valid Expo push token"
- Token generation failed
- **Solution**: Check internet connection, restart app

#### Backend error: "Cannot find module 'expo-server-sdk'"
- Backend dependencies not installed
- **Solution**: `cd api && npm install expo-server-sdk`

---

## 🧪 Advanced Testing

### Test Flight Reminders

Add this code to your FlightDetailsScreen after saving a flight:

```typescript
import { scheduleFlightReminder } from '~/services/notificationService';

// After successfully saving flight
await scheduleFlightReminder(
  flight.flightNumber,
  new Date(flight.departureTime),
  24  // Remind 24 hours before
);
```

### Test Push Notification from Backend

Use a tool like **Postman** or **curl**:

```bash
curl -X POST http://YOUR_IP:3000/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "email": "your@email.com",
    "title": "Test Push",
    "body": "This is a test push notification!"
  }'
```

### Test Using Expo's Online Tool

1. Copy your Expo Push Token from the console
2. Go to: https://expo.dev/notifications
3. Paste your token
4. Enter a title and message
5. Click "Send a Notification"

---

## 📊 Expected Console Output

### Mobile App Console

```
Expo Push Token: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
Notification received: {
  request: {
    content: {
      title: '✈️ Test Notification',
      body: 'This is a test notification from JetShifter!'
    }
  }
}
```

### Backend Console

```
Push token registered with backend
Push notification sent: [ { status: 'ok', id: '...' } ]
```

---

## 🎯 Next Steps After Successful Test

Once notifications are working:

1. **Integrate flight reminders** - Schedule notifications when users save flights
2. **Add intervention reminders** - Notify users about melatonin/coffee times
3. **Set up backend scheduling** - Use cron jobs to send reminders automatically
4. **Test notification actions** - Add buttons to notifications (snooze, view flight, etc.)

---

## 📚 Key Files to Check

- **Mobile**: `mobile/src/contexts/NotificationContext.tsx` - Token registration
- **Mobile**: `mobile/src/services/notificationService.ts` - Notification utilities
- **Mobile**: `mobile/src/screens/UserDetailsScreen.tsx` - Test button
- **Backend**: `api/src/notifications/notifications.service.ts` - Push service
- **Backend**: `api/src/users/users.controller.ts` - Token registration endpoint

---

## 💡 Testing Checklist

- [ ] Backend server running
- [ ] App running on physical Android device
- [ ] Notification permissions granted
- [ ] Expo Push Token generated and logged
- [ ] Token saved to backend (check user profile in database)
- [ ] Test notification button appears in User Profile
- [ ] Clicking "Test Notification" shows success alert
- [ ] Notification appears after 5 seconds
- [ ] Notification shows correct title and message
- [ ] Tapping notification opens/focuses app

---

## 🆘 Get Help

If you encounter issues:

1. Check the console logs (both mobile and backend)
2. Verify permissions in device settings
3. Ensure backend URL in `constants.ts` is correct
4. Try uninstalling and reinstalling the app
5. Make sure you're using a physical device, not emulator

---

*Testing Guide Created: November 25, 2025*
