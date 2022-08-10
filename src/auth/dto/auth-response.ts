import { ApiProperty } from "@nestjs/swagger";
import { BaseResponse } from "src/common/response/base-response";
import { User } from "src/user/entity/user.entity";

export abstract class LoginResponseData {
  @ApiProperty({ description: 'User 정보' })
  user: User;

  @ApiProperty({ description: 'access token' })
  accssToken: string;
}

export abstract class RegisterResponseData {
  @ApiProperty({ description: '생성된 User 정보' })
  user: User;
}

export class AuthResponse extends BaseResponse {
  constructor() {
    super();
  }
  
  @ApiProperty()
  data?: LoginResponseData | RegisterResponseData;
  
  public static response(statusCode?: number, message?: string, data?: any) {
    const response = new AuthResponse();

    if (data) {
      response.data = data;
    }
    response.message = message;
    response.statusCode = statusCode || 200;
  
    return response;
    }
  }