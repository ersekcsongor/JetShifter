## 🔥 Firebase Push Notifications Setup Guide

## Overview

Firebase Cloud Messaging (FCM) provides **FREE** push notifications for Android (and iOS with Apple Developer account).

---

## 📋 Step 1: Create Firebase Project

### 1.1 Go to Firebase Console
Visit: https://console.firebase.google.com/

### 1.2 Create New Project
1. Click "Add project"
2. Enter project name: **"JetShifter"**
3. (Optional) Enable Google Analytics
4. Click "Create project"

---

## 📱 Step 2: Add Android App

### 2.1 Register App
1. In Firebase console, click Android icon
2. Enter Android package name: **`com.jetshifter.mobile`**
3. (Optional) Add app nickname: "JetShifter Mobile"
4. Click "Register app"

### 2.2 Download google-services.json
1. Download `google-services.json` file
2. Place it in: `mobile/google-services.json`

```bash
# From your downloads folder
cp ~/Downloads/google-services.json mobile/google-services.json
```

### 2.3 Update app.json

The file already has the package name set. Just verify:

**File**: `mobile/app.json`
```json
{
  "expo": {
    "android": {
      "package": "com.jetshifter.mobile"
    }
  }
}
```

---

## 🔑 Step 3: Backend Service Account

### 3.1 Generate Service Account Key
1. In Firebase console → Project settings (gear icon)
2. Go to "Service accounts" tab
3. Click "Generate new private key"
4. Download the JSON file

### 3.2 Save Service Account Credentials

**Option A: Environment Variable (Recommended)**

Create or update your `.env.yml` file:

**File**: `api/.env.yml`
```yaml
firebase:
  serviceAccount: |
    {
      "type": "service_account",
      "project_id": "your-project-id",
      "private_key_id": "...",
      "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
      "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
      "client_id": "...",
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": "..."
    }
```

**Option B: Separate File**

1. Save the downloaded JSON as: `api/firebase-service-account.json`
2. Add to `.gitignore`:
   ```
   firebase-service-account.json
   ```

---

## 🛠️ Step 4: Initialize Firebase in Backend

**File**: `api/src/main.ts`

Add Firebase initialization:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as yaml from 'yaml';

async function bootstrap() {
  // Initialize Firebase Admin SDK
  try {
    // Option A: From .env.yml
    const yamlConfig = yaml.parse(fs.readFileSync('.env.yml', 'utf8'));
    const serviceAccount = JSON.parse(yamlConfig.firebase.serviceAccount);

    // Option B: From separate file
    // const serviceAccount = require('../firebase-service-account.json');

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('✅ Firebase Admin SDK initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
  }

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

---

## 🧪 Step 5: Test Notifications

### 5.1 Start Your Servers

**Terminal 1 - Backend:**
```bash
cd api
npm run start:dev
```

**Terminal 2 - Mobile:**
```bash
cd mobile
npx expo run:android
```

### 5.2 Test in App

1. Open app on your Android device
2. Grant notification permissions
3. Check console for FCM token:
   ```
   ✅ Firebase notifications initialized!
   FCM Token: xxxxxxxxxxxxxxxxxxxx
   FCM token registered with backend
   ```

### 5.3 Send Test Notification from Backend

Use the test endpoint:

**Postman/curl:**
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

---

## 📊 Update Notifications Module

**File**: `api/src/notifications/notifications.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsService } from './notifications.service';
import { FirebaseNotificationsService } from './firebase-notifications.service';
import { NotificationsController } from './notifications.controller';
import { UserModel, UserSchema } from '../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, FirebaseNotificationsService],
  exports: [NotificationsService, FirebaseNotificationsService],
})
export class NotificationsModule {}
```

---

## 🎯 Using Firebase Notifications

### Send Flight Reminder

```typescript
import { FirebaseNotificationsService } from './firebase-notifications.service';

// In your service
await this.firebaseNotifications.sendFlightReminder(
  'user@example.com',
  'BA123',
  new Date('2025-12-01T10:00:00Z')
);
```

### Send Intervention Reminder

```typescript
await this.firebaseNotifications.sendInterventionReminder(
  'user@example.com',
  'melatonin',
  new Date()
);
```

### Send Custom Notification

```typescript
await this.firebaseNotifications.sendNotificationToUser(
  'user@example.com',
  '✈️ Custom Title',
  'Custom message body',
  { customData: 'value' }
);
```

### Send to Multiple Users

```typescript
await this.firebaseNotifications.sendBulkNotifications(
  ['user1@email.com', 'user2@email.com'],
  'Group Notification',
  'This goes to multiple users'
);
```

### Send to Topic (All Users)

```typescript
// Users subscribe to topic in app
await subscribeToTopic('all-users');

// Backend sends to topic
await this.firebaseNotifications.sendToTopic(
  'all-users',
  'Announcement',
  'Message to all users'
);
```

---

## ✅ Verification Checklist

- [ ] Firebase project created
- [ ] Android app registered in Firebase
- [ ] `google-services.json` downloaded and placed in `mobile/` folder
- [ ] Service account key generated
- [ ] Service account credentials in `api/.env.yml` or `firebase-service-account.json`
- [ ] Firebase Admin SDK initialized in `main.ts`
- [ ] Backend server starts without errors
- [ ] Mobile app shows "Firebase notifications initialized!"
- [ ] FCM token appears in console
- [ ] Test notification received on device

---

## 🚨 Troubleshooting

### "google-services.json not found"
- Make sure file is in `mobile/google-services.json`
- Check filename spelling

### "Firebase Admin SDK initialization failed"
- Verify service account JSON is valid
- Check credentials path in `main.ts`
- Ensure all keys are present in JSON

### "No FCM token generated"
- Make sure you're using a physical device
- Check notification permissions are granted
- Verify `google-services.json` is correct

### "Notification not received"
- Check device notification settings
- Verify FCM token is registered in database
- Check backend logs for errors
- Test with Firebase Console: Project → Cloud Messaging → Send test message

---

## 💰 Cost

- ✅ **Completely FREE** for Android
- ✅ No limits for reasonable usage
- ✅ No credit card required

---

## 📚 Next Steps

1. Complete Firebase setup
2. Test notifications
3. Integrate with flight save functionality
4. Set up scheduled reminders
5. (Optional) Add iOS support with Apple Developer account

---

*Firebase Setup Guide - November 25, 2025*
