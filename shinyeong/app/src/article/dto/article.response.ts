import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from 'src/utils/responseHandler/baseResponse.dto';
import { Article } from '../entities/article.entity';

export abstract class DefaultResponseData {
  @ApiProperty()
  article: Article;
}

export class DefaultResponse extends BaseResponse {
  constructor() {
    super();
  }
  @ApiProperty()
  data: DefaultResponseData;

  public static response(data: any, statusCode?: number, message?: string) {
    const response = new DefaultResponse();
    response.data = data;
    response.message = message;
    response.statusCode = statusCode || 200;

    return response;
  }
}
