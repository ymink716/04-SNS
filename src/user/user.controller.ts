import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ErrorType } from 'src/utils/error.enum';
import { GetUser } from 'src/utils/get-user.decorator';
import { ResponseType } from 'src/utils/response.enum';
import { User } from './entity/user.entity';
import { UserService } from './user.service';

@ApiTags('users')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth('access_token')
  @ApiResponse({ description: ResponseType.getUser.message })
  @ApiOperation({ description: '유저 정보를 가져옵니다.', summary: '유저 정보' })
  @Get()
  async getUser(@GetUser() user: User) {
    return user;
  }
}
