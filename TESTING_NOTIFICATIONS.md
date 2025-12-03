# 🧪 Testing Firebase Notifications - Step by Step

## Current Status
✅ Code is ready
✅ Backend configured
✅ Mobile app configured
⏳ Need Firebase credentials

---

## 📋 Step-by-Step Testing Guide

### Step 1: Get Firebase Credentials (One-time setup)

#### A. Create Firebase Project
1. Open: **https://console.firebase.google.com/**
2. Click **"Add project"**
3. Project name: **"JetShifter"**
4. Click **"Continue"** → **"Create project"**

#### B. Add Android App to Firebase
1. In Firebase console, click the **Android icon**
2. **Android package name**: `com.jetshifter.mobile`
3. App nickname: "JetShifter Mobile" (optional)
4. Click **"Register app"**
5. **Download `google-services.json`**
6. **Save it to**: `mobile/google-services.json`

#### C. Get Backend Service Account Key
1. Click **gear icon** (Project Settings) in Firebase console
2. Go to **"Service accounts"** tab
3. Click **"Generate new private key"**
4. **Download the JSON file**
5. **Save as**: `api/firebase-service-account.json`

**Important**: Add this to `.gitignore`:
```
firebase-service-account.json
google-services.json
```

---

### Step 2: Verify Files Are in Place

Check you have these files:

```
mobile/
  └── google-services.json  ✅

api/
  └── firebase-service-account.json  ✅
```

---

### Step 3: Start Backend

```bash
cd api
npm run start:dev
```

**Expected output**:
```
✅ Firebase Admin SDK initialized
🚀 Server running on http://0.0.0.0:3000
```

If you see:
```
⚠️ Firebase Admin SDK initialization failed
```
→ Check that `firebase-service-account.json` is in the `api/` folder

---

### Step 4: Build and Run Mobile App

**IMPORTANT**: Firebase requires a **development build**, not Expo Go!

```bash
cd mobile
npx expo run:android
```

**What happens**:
1. Builds native Android app with Firebase (~5 minutes first time)
2. Installs on your connected Android device
3. App starts automatically

**Expected console output**:
```
✅ Firebase notifications initialized!
FCM Token: dxxxxxxxxxxxxxxxxxxxxx
FCM token registered with backend
```

---

### Step 5: Test Notifications

#### Option A: Use Test Button in App

1. Open app on your device
2. Log in
3. Go to **User Profile**
4. Tap **"Test Notification"** button
5. Wait 5 seconds → Notification appears! 🎉

#### Option B: Send from Backend

Use Postman or curl:

```bash
curl -X POST http://YOUR_IP:3000/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "email": "your@email.com",
    "title": "Test from Backend",
    "body": "This is a Firebase push notification!"
  }'
```

Replace:
- `YOUR_IP` - Your computer's IP
- `YOUR_JWT_TOKEN` - Get from login response
- `your@email.com` - Your logged-in email

#### Option C: Send from Firebase Console

1. Go to Firebase Console
2. **Cloud Messaging** → **"Send your first message"**
3. Notification title: "Test"
4. Notification text: "Test notification"
5. Click **"Send test message"**
6. Paste your FCM token (from console logs)
7. Click **"Test"**

---

## 🎯 What Should Happen

### When App Starts:
```
✅ Firebase notifications initialized!
FCM Token: dXXXXXXXXXXXXXXXXXXXXXX
FCM token registered with backend
```

### When Notification Sent:
- 🔔 Notification appears on device
- If app is open: Shows as banner
- If app is closed: Shows in notification drawer
- Tapping notification opens app

---

## 🚨 Troubleshooting

### "google-services.json not found"
**Problem**: File not in the right place
**Solution**:
```bash
# Make sure it's in mobile folder
ls mobile/google-services.json
```

### "Firebase Admin SDK initialization failed"
**Problem**: Backend can't find service account
**Solution**:
```bash
# Make sure it's in api folder
ls api/firebase-service-account.json
```

### "Firebase notifications not available"
**Problem**: Running in Expo Go (doesn't support Firebase)
**Solution**: Use `npx expo run:android` instead

### No FCM token in console
**Problem**:
- Not on physical device
- Permissions not granted
- google-services.json incorrect

**Solution**:
1. Use physical Android device (not emulator)
2. Grant notification permissions when asked
3. Verify google-services.json matches your Firebase project

### Notification not received
**Problem**: Token not registered or notification failed
**Check**:
1. Backend logs - any errors?
2. Device notification settings - enabled?
3. FCM token in database - saved correctly?

---

## ✅ Success Checklist

After following all steps, you should have:

- [ ] Firebase project created
- [ ] `google-services.json` in `mobile/` folder
- [ ] `firebase-service-account.json` in `api/` folder
- [ ] Backend shows "Firebase Admin SDK initialized"
- [ ] Mobile app shows "Firebase notifications initialized!"
- [ ] FCM token appears in console
- [ ] FCM token saved to backend
- [ ] Test notification received on device
- [ ] Notification appears when sent from backend

---

## 🎉 Next Steps

Once notifications work:

1. **Schedule flight reminders** - Notify before flights
2. **Send intervention alerts** - Remind about melatonin/coffee
3. **Light exposure reminders** - Alert for optimal light times
4. **Custom notifications** - Any flight-related updates

---

## 📖 Additional Resources

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Documentation](https://firebase.google.com/docs/cloud-messaging)
- [FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md) - Detailed setup
- [FIREBASE_QUICK_START.md](./FIREBASE_QUICK_START.md) - Quick reference

---

*Testing Guide - November 25, 2025*
