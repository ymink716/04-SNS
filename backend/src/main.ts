import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentationOptions } from './common/config/swagger/documentationOptions';
import { SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filter/httpExceptionFilter';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('/api/v1');
  app.use(cookieParser());
  app.enableCors({
    credentials: true,
    origin: [`${process.env.ALLOW_ORIGIN_URL}`],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      enableDebugMessages: true,
      exceptionFactory(errors) {
        const message = Object.values(errors[0].constraints);
        throw new BadRequestException(message[0]);
      },
    }),
  );

  const documentOptions = new DocumentationOptions().initializeOptions();
  const document = SwaggerModule.createDocument(app, documentOptions);
  SwaggerModule.setup('api/docs', app, document);
  await app.listen(3003);
}
bootstrap();
