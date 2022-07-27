import { ApiProperty } from "@nestjs/swagger";
import { Comment } from "src/comment/entity/comment.entity";
import { BaseResponse } from "src/common/response-handler/base-response";
import { Post } from "../entity/post.entity";

export abstract class PostResponseData {
  @ApiProperty({ description: '게시물 정보' })
  post: Post;
}

export abstract class PostDetailResponseData {
  @ApiProperty({ description: '게시물 정보' })
  post: Post;

  @ApiProperty({ description: '댓글 리스트' })
  comments: Comment[];
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
  data?: PostResponseData | PostDetailResponseData | PostListResponseData;
  
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