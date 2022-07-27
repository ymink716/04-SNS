import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ErrorType } from 'src/common/type/error-type.enum';
import { GetUser } from 'src/common/custom-decorator/get-user.decorator'; 
import { ResponseType } from 'src/common/type/response-type.enum'; 
import { User } from './entity/user.entity';
import { UserService } from './user.service';
import { UserResponse } from './dto/user-response';

@ApiTags('users')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * @description 사용자 정보 가져오기
  */
  @ApiBearerAuth('access_token')
  @ApiOperation({ description: '유저 정보를 가져옵니다.', summary: '유저 정보' })
  @ApiResponse({ description: ResponseType.getUser.message })
  @Get()
  async getUser(@GetUser() user: User) {
    return UserResponse.response(
      ResponseType.getUser.code,
      ResponseType.getUser.message,
      user.toJSON(),
    )
  }
}
