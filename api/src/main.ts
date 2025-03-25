import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
  origin: true, 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
});
  
  await app.listen(3000, '0.0.0.0');
}
bootstrap();

