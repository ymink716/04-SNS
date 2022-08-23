import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUserInput } from './dto/createUser.input';
import { UserService } from './user.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { JwtAccessGuard } from 'src/common/auth/guard/jwtAccess.guard';
import { CurrentUser, ICurrentUser } from 'src/common/auth/currentUser';
import { ResponseType } from 'src/common/type/response.type';
import { ErrorType } from 'src/common/type/error.type';

@ApiTags('User')
@Controller({ path: 'user', version: 'v1' })
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * @summary 유저 조회 Api
   * @param currentUser
   * @returns `User`
   */
  @Get()
  @UseGuards(JwtAccessGuard)
  // 스웨거 데코레이터
  @ApiOperation({ description: '유저조회 API입니다', summary: '유저 조회' })
  @ApiBearerAuth('access_token')
  @ApiOkResponse({ type: User, description: ResponseType.user.getUser.msg })
  @ApiUnauthorizedResponse({ description: ErrorType.auth.unauthorized.msg })
  async fetchUser(@CurrentUser() currentUser: ICurrentUser): Promise<User> {
    const result = await this.userService.fetch({ email: currentUser.email });
    delete result.password;
    return result;
  }

  /**
   * @summary 유저 회원 가입 Api
   * @param createUserInput
   * @returns `User`
   */
  @Post()
  //스웨거 데코레이터
  @ApiOperation({
    description: '유저 회원가입 API입니다',
    summary: '유저 회원가입',
  })
  @ApiCreatedResponse({
    type: User,
    description: ResponseType.user.createUser.msg,
  })
  @ApiBadRequestResponse({
    description: ErrorType.user.passwordDoesNotMatch.msg,
  })
  @ApiConflictResponse({
    description: ErrorType.user.emailExist.msg,
  })
  createUser(
    @Body(ValidationPipe) createUserInput: CreateUserInput,
  ): Promise<User> {
    return this.userService.signup({ createUserInput });
  }
}
