import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { BaseAPIDocumentation } from './configs/swagger.config';
import { SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.setGlobalPrefix('/api');
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());

  // Swagger API Docs
  const documentOptions = new BaseAPIDocumentation().initializeOptions();
  const document = SwaggerModule.createDocument(app, documentOptions);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
}
bootstrap();
