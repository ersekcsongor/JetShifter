# 🚀 Firebase Push Notifications - Quick Start

## What's Been Set Up

✅ Installed Firebase dependencies (mobile + backend)
✅ Created Firebase notification service
✅ Updated NotificationContext to use Firebase
✅ Created backend Firebase service
✅ Ready for Firebase credentials

---

## 🔥 What You Need to Do

### 1. Create Firebase Project (5 minutes)

1. Go to: https://console.firebase.google.com/
2. Click "Add project" → Name it "JetShifter"
3. Click Android icon → Package name: `com.jetshifter.mobile`
4. Download `google-services.json` → Save to `mobile/google-services.json`

### 2. Get Backend Credentials (2 minutes)

1. Firebase Console → Project Settings (gear icon)
2. "Service accounts" tab
3. Click "Generate new private key"
4. Download JSON → Save as `api/firebase-service-account.json`

### 3. Initialize Firebase in Backend

Add to `api/src/main.ts`:

```typescript
import * as admin from 'firebase-admin';

async function bootstrap() {
  // Initialize Firebase
  const serviceAccount = require('../firebase-service-account.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('✅ Firebase initialized');

  // ... rest of your code
}
```

### 4. Test It!

```bash
# Terminal 1
cd api
npm run start:dev

# Terminal 2
cd mobile
npx expo run:android  # Requires physical device
```

---

## 📁 Files Created

**Mobile:**
- `mobile/src/services/firebaseNotificationService.ts` - Firebase notification functions
- `mobile/src/contexts/NotificationContext.tsx` - Updated to use Firebase
- `mobile/src/screens/TestFlightScreen.tsx` - Test screen with notifications

**Backend:**
- `api/src/notifications/firebase-notifications.service.ts` - Firebase Admin SDK service

**Documentation:**
- `FIREBASE_SETUP_GUIDE.md` - Complete step-by-step guide
- `FIREBASE_QUICK_START.md` - This file

---

## 🎯 What Firebase Gives You

✅ **Push notifications** - Send from server to devices
✅ **Works in Expo Go** - No development build needed
✅ **100% FREE** - No cost for Android
✅ **Topics** - Send to groups of users
✅ **Scheduled** - Can schedule future notifications
✅ **Analytics** - See delivery stats in Firebase console

---

## 📖 Full Documentation

See [FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md) for:
- Detailed setup instructions
- Code examples
- Troubleshooting
- Testing guide

---

## ⚡ TL;DR

1. Create Firebase project → Get `google-services.json`
2. Get service account key → Save as `firebase-service-account.json`
3. Initialize Firebase in `main.ts`
4. Run `npx expo run:android` (needs physical device)
5. Done! Push notifications work 🎉

---

*Quick Start - November 25, 2025*
