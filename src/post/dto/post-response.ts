import { ApiProperty } from "@nestjs/swagger";
import { BaseResponse } from "src/common/response/base-response";
import { Post } from "../entity/post.entity";

export abstract class PostResponseData {
  @ApiProperty({ description: '게시물 정보' })
  post: Post;
}

export abstract class PostListResponseData {
  @ApiProperty({ description: '게시물 리스트' })
  posts: Post[];
}

export class PostResponse extends BaseResponse {
  constructor() {
    super();
  }
  
  @ApiProperty()
  data?: PostResponseData | PostListResponseData;
  
  public static response(statusCode?: number, message?: string, data?: any) {
    const response = new PostResponse();

    response.statusCode = statusCode || 200;
    response.message = message;
    if (data) {
      response.data = data;
    }
    
    return response;
  }
}