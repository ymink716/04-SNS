import { ApiProperty } from "@nestjs/swagger";
import { Comment } from "src/comment/entity/comment.entity";
import { BaseResponse } from "src/common/response/base-response";

export abstract class CommentResponseData {
  @ApiProperty({ description: '게시물 정보' })
  comment: Comment;
}


export class CommentResponse extends BaseResponse {
  constructor() {
    super();
  }
  
  @ApiProperty()
  data?: CommentResponseData;
  
  public static response(statusCode?: number, message?: string, data?: any) {
    const response = new CommentResponse();

    response.statusCode = statusCode || 200;
    response.message = message;
    if (data) {
      response.data = data;
    }
    
    return response;
  }
}