import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove properties not in the DTO
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are found
      transform: true, // Transform payloads to DTO instances
    })
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

