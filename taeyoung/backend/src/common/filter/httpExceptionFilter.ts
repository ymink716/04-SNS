import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException //
        ? Number(exception.getStatus())
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception.message;

    console.log('==========');
    console.log('에러 발생!');
    console.log('에러코드: ', status);
    console.log('에러내용: ', message);
    console.log('==========');
    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date(),
    });
  }
}
