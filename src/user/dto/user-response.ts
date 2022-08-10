import { ApiProperty } from "@nestjs/swagger";
import { BaseResponse } from "src/common/response/base-response";
import { User } from "src/user/entity/user.entity";

export abstract class GetUserResponseData {
  @ApiProperty({ description: 'User 정보' })
  user: User;
}

export abstract class GetUsersResponseData {
  @ApiProperty({ description: 'User 리스트' })
  users: User[];
}

export class UserResponse extends BaseResponse {
  constructor() {
    super();
  }
  
  @ApiProperty()
  data?: GetUserResponseData | GetUsersResponseData;
  
  public static response(statusCode?: number, message?: string, data?: any) {
    const response = new UserResponse();

    if (data) {
      response.data = data;
    }
    response.message = message;
    response.statusCode = statusCode || 200;
  
    return response;
    }
  }