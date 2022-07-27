import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { BaseAPIDocumentation } from './common/config/swagger.config';
import { SwaggerModule } from '@nestjs/swagger';
import * as requestIp from 'request-ip';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.setGlobalPrefix('/api');

  app.use(requestIp.mw());
  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe());

  //app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));


  // Swagger API Docs
  const documentOptions = new BaseAPIDocumentation().initializeOptions();
  const document = SwaggerModule.createDocument(app, documentOptions);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
}
bootstrap();
