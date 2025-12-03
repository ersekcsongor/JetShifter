# 🔧 Quick Fix for "rnfbappmodule not found" Error

## The Problem

You're getting `rnfbappmodule not found` error because React Native Firebase doesn't work in **Expo Go**. It requires a **development build**.

## ✅ Quick Solution: Use Local Notifications (Works NOW)

You have 2 options:

---

## Option 1: Test Local Notifications in Expo Go (EASIEST - 2 minutes)

This lets you test notifications **right now** without Firebase or building:

### Step 1: Replace NotificationContext

Rename the current file:
```bash
cd mobile/src/contexts
mv NotificationContext.tsx NotificationContext.firebase.tsx
mv NotificationContext.simple.tsx NotificationContext.tsx
```

Or manually:
1. Rename `NotificationContext.tsx` → `NotificationContext.firebase.tsx`
2. Rename `NotificationContext.simple.tsx` → `NotificationContext.tsx`

### Step 2: Test It!

```bash
cd mobile
npx expo start
```

Then:
1. Open Expo Go on your phone
2. Scan QR code
3. Login → User Profile
4. Tap "Test Notification"
5. Wait 5 seconds → Notification appears! ✅

**This works because:**
- Local notifications don't need Firebase
- Local notifications work in Expo Go
- Scheduled reminders work perfectly

---

## Option 2: Use Firebase (Requires Build - 10-15 minutes)

For full push notifications from server:

### Step 1: Get Firebase Credentials

1. Go to: https://console.firebase.google.com/
2. Create project "JetShifter"
3. Add Android app → Package: `com.jetshifter.mobile`
4. Download `google-services.json` → Save to `mobile/google-services.json`
5. Get service account key → Save to `api/firebase-service-account.json`

### Step 2: Build Development Version

```bash
cd mobile
npx expo run:android
```

This builds a native Android app with Firebase support (~10 min first time).

### Step 3: Keep Firebase Version

Use the Firebase version of NotificationContext:
```bash
cd mobile/src/contexts
mv NotificationContext.tsx NotificationContext.simple.tsx
mv NotificationContext.firebase.tsx NotificationContext.tsx
```

---

## 🎯 Comparison

| Feature | Option 1 (Local) | Option 2 (Firebase) |
|---------|-----------------|---------------------|
| **Setup time** | 2 minutes | 15 minutes |
| **Works in Expo Go** | ✅ Yes | ❌ No (needs build) |
| **Local notifications** | ✅ Yes | ✅ Yes |
| **Push from server** | ❌ No | ✅ Yes |
| **Scheduled reminders** | ✅ Yes | ✅ Yes |
| **Flight reminders** | ✅ Yes | ✅ Yes |
| **Free** | ✅ Yes | ✅ Yes |

---

## 💡 Recommendation

**Start with Option 1** (Local notifications):
- Test notifications work immediately
- No Firebase setup needed
- Works for most use cases (scheduled reminders)

**Upgrade to Option 2** later if you need:
- Push notifications from server
- Remote triggering of notifications
- Real-time updates

---

## 🧪 Quick Test Commands

### Option 1 (Local - Expo Go):
```bash
cd mobile/src/contexts
mv NotificationContext.tsx NotificationContext.firebase.tsx
mv NotificationContext.simple.tsx NotificationContext.tsx
cd ../../..
npx expo start
```

### Option 2 (Firebase - Development Build):
```bash
cd mobile/src/contexts
mv NotificationContext.tsx NotificationContext.simple.tsx
mv NotificationContext.firebase.tsx NotificationContext.tsx
cd ../../..
npx expo run:android
```

---

*Quick Fix Guide - November 25, 2025*
