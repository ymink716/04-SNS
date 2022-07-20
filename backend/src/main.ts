import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentationOptions } from './config/swagger/documentationOptions';
import { SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const documentOptions = new DocumentationOptions().initializeOptions();
  const document = SwaggerModule.createDocument(app, documentOptions);
  SwaggerModule.setup('api/docs', app, document);
  await app.listen(3003);
}
bootstrap();
