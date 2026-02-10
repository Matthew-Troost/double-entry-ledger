import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ApiPublicModule } from './ApiPublic.module';
import { DomainExceptionFilter } from '@/common/filters/domain-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(ApiPublicModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new DomainExceptionFilter());

  await app.listen(5000);
}

bootstrap();
