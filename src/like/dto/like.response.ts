import { ApiProperty } from "@nestjs/swagger";
import { BaseResponse } from "src/common/response/base-response";

export class LikeResponse extends BaseResponse {
  constructor() {
    super();
  }
  
  @ApiProperty()
  public static response(statusCode?: number, message?: string) {
    const response = new LikeResponse();

    response.statusCode = statusCode || 200;
    response.message = message;

    return response;
  }
}