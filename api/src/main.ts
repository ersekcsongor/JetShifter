import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { ClassSerializerInterceptor } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { config } from './shared/config/config';


async function bootstrap() {
  // Initialize Firebase Admin SDK
  try {
    const firebaseConfig = config.get('firebase');
    const serviceAccount = firebaseConfig.service_account;

    // Check if we have Firebase credentials
    if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
      throw new Error('Firebase credentials not configured. Set FIREBASE_SERVICE_ACCOUNT_PROJECT_ID, FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL, and FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY environment variables.');
    }

    // Initialize with environment variables
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        // Handle escaped newlines in private key
        privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
      }),
      storageBucket: firebaseConfig.storage_bucket || 'jetshifter-dcf02.firebasestorage.app',
    });
    console.log('✅ Firebase Admin SDK initialized with Storage');
  } catch (error) {
    console.error('⚠️ Firebase Admin SDK initialization failed:', error.message);
    console.log('Push notifications and storage will not work until Firebase is configured.');
    console.log('See FIREBASE_SETUP_GUIDE.md for setup instructions.');
  }

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server running on http://0.0.0.0:${port}`);
}
bootstrap();

