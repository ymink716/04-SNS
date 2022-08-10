import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { BaseAPIDocumentation } from './common/config/swagger.config';
import { SwaggerModule } from '@nestjs/swagger';
import * as requestIp from 'request-ip';
import { HttpExceptionFilter } from './common/exception/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.setGlobalPrefix('/api');

  app.use(requestIp.mw());
  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe({
    transform: true,  // mapping class로 변환 허용
    transformOptions: {
      enableImplicitConversion: true  // 암묵적으로 타입을 변환
    }
  }));

  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger API Docs
  const documentOptions = new BaseAPIDocumentation().initializeOptions();
  const document = SwaggerModule.createDocument(app, documentOptions);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
}
bootstrap();
