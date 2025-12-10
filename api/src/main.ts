import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { ClassSerializerInterceptor } from '@nestjs/common';
import * as admin from 'firebase-admin';


async function bootstrap() {
  // Initialize Firebase Admin SDK
  try {
    const serviceAccount = require('../jetshifter-dcf02-firebase-adminsdk-fbsvc-ec0ba1e1e6.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: 'jetshifter-dcf02.firebasestorage.app', // Your Firebase Storage bucket
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

  await app.listen(3000, '0.0.0.0');
  console.log('🚀 Server running on http://0.0.0.0:3000');
}
bootstrap();

