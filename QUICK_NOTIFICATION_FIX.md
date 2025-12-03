# Quick Notification Fix

## The Problem

Expo Go **no longer supports push notifications** as of SDK 53. You saw this error:
```
ERROR  expo-notifications: Android Push notifications (remote notifications)
functionality provided by expo-notifications was removed from Expo Go
```

## The Solution

You need to create a **development build** instead of using Expo Go.

---

## 🚀 Quick Fix - Build Development Version

### Step 1: Install EAS CLI (if not already installed)

```bash
npm install -g eas-cli
```

### Step 2: Login to Expo (Create free account if needed)

```bash
eas login
```

### Step 3: Configure EAS

```bash
cd mobile
eas build:configure
```

This will create `eas.json` in your project.

### Step 4: Build for Android (Development)

```bash
eas build --profile development --platform android
```

**Wait time**: 10-20 minutes (builds in the cloud)

### Step 5: Install on Device

Once build completes:
1. You'll get a download link
2. Download the APK on your Android device
3. Install it (you may need to allow "Install from unknown sources")

### Step 6: Run Development Server

```bash
npx expo start --dev-client
```

Now notifications will work! 🎉

---

## ⚡ Faster Alternative - Local Build (If you have Android Studio)

If you have Android Studio installed with Android SDK:

```bash
cd mobile
npx expo run:android
```

This builds locally and installs directly on your connected device. **Much faster** than cloud build!

---

## 🧪 Simplified Testing (Without Development Build)

If you want to test **right now** without building, you can test **local notifications only**:

### Option A: Test with Basic React Native App

The notification service will still work for **local/scheduled notifications** (the ones that don't require push tokens). However, you won't be able to:
- Test push notifications from server
- Register push tokens
- Receive remote notifications

But you CAN test:
- ✅ Local scheduled notifications
- ✅ Flight reminders (scheduled locally)
- ✅ Intervention reminders (scheduled locally)

### Option B: Comment Out Push Token Registration (Temporary)

Edit `mobile/src/contexts/NotificationContext.tsx`:

```typescript
// Temporarily comment out token registration for Expo Go testing
useEffect(() => {
  registerForPushNotificationsAsync().then(async (token) => {
    setExpoPushToken(token);

    // COMMENTED OUT FOR EXPO GO TESTING
    /*
    if (token && authState?.user?.email) {
      try {
        await axios.post(`${ENV.API_BASE_URL}/users/register-push-token`, {
          email: authState.user.email,
          pushToken: token,
        });
        console.log('Push token registered with backend');
      } catch (error) {
        console.error('Failed to register push token with backend:', error);
      }
    }
    */
  });
  // ... rest of code
```

This way the app won't crash when it can't get a push token, and you can still test local notifications.

---

## 📊 Comparison

| Feature | Expo Go | Development Build |
|---------|---------|-------------------|
| Local notifications | ✅ | ✅ |
| Push notifications | ❌ | ✅ |
| Push tokens | ❌ | ✅ |
| Build time | Instant | 10-20 min (first time) |
| Setup | None | One-time EAS setup |

---

## 🎯 Recommended Path

### For Quick Testing NOW:
1. Comment out push token registration (see Option B above)
2. Test with Expo Go
3. Local notifications will work

### For Full Notification Support:
1. Create development build with EAS (`eas build --profile development --platform android`)
2. Install APK on device
3. Run with `npx expo start --dev-client`
4. Everything works!

---

## 💡 The "Test Notification" Button Will Still Work!

Even in Expo Go, when you tap "Test Notification" in the app, it will:
- Schedule a local notification
- Show the notification after 5 seconds
- Work perfectly ✅

What WON'T work in Expo Go:
- Getting an Expo Push Token
- Registering token with backend
- Receiving push notifications from server

---

## 🔧 Quick Commands Summary

### Option 1: Use Development Build (Full Features)
```bash
# One-time setup
npm install -g eas-cli
eas login
cd mobile
eas build:configure

# Build and install
eas build --profile development --platform android
# Download APK and install on device

# Run app
npx expo start --dev-client
```

### Option 2: Local Build (Faster, requires Android Studio)
```bash
cd mobile
npx expo run:android
```

### Option 3: Test in Expo Go (Limited)
```bash
# Comment out push token code in NotificationContext.tsx first!
cd mobile
npx expo start
# Scan QR with Expo Go
```

---

*Quick Fix Guide - November 25, 2025*
