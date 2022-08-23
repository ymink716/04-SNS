import { DocumentBuilder } from '@nestjs/swagger';

export class DocumentationOptions {
  public builder = new DocumentBuilder();

  public initializeOptions() {
    return this.builder
      .setTitle('SNS API Server')
      .setDescription('SNS API 서버입니다.')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'access_token',
          description: 'access token을 입력하세요.',
          in: 'header',
        },
        'access_token',
      )
      .build();
  }
}
