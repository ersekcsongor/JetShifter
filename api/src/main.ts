import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { ClassSerializerInterceptor } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
  origin: true, 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
});
app.useGlobalPipes(new ValidationPipe());
app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  await app.listen(3000, '0.0.0.0');
}
bootstrap();

