import {
  Body,
  Controller,
  ForbiddenException,
  NotFoundException,
  Post,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentUser, ICurrentUser } from 'src/common/auth/currentUser';
import { JwtRefreshGuard } from 'src/common/auth/guard/jwtRefresh.guard';
import { ErrorType } from 'src/common/type/error.type';
import { ResponseType } from 'src/common/type/response.type';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { loginInput } from './dto/login.input';

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  /**
   * @summary 로그인 조회 Api
   * @description 로그인시 액세스 토큰을 리턴하며 쿠키에 리프레시 토큰을 세팅합니다
   * @param res
   * @param loginInput
   * @returns string
   */
  @Post('login')
  // 스웨거 데코레이터
  @ApiBody({ type: loginInput })
  @ApiOperation({ description: '로그인 API입니다', summary: '로그인' })
  @ApiCreatedResponse({
    description: ResponseType.auth.loginUser.msg,
  })
  @ApiNotFoundResponse({ description: ErrorType.user.userNotFound.msg })
  @ApiForbiddenResponse({ description: ErrorType.auth.validatePassword.msg })
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body(ValidationPipe) loginInput: loginInput,
  ) {
    const { email, password } = loginInput;
    const user = await this.userService.fetch({ email });
    if (!user) throw new NotFoundException(ErrorType.user.userNotFound.msg);

    // jwt 토큰 검증
    const isAuth = this.authService.validatePassword({
      plainPW: password,
      hashedPW: user.password,
    });
    if (!isAuth) throw new ForbiddenException(ErrorType.auth.unauthorized.msg);

    await this.authService.setRefreshToken({ user, res });
    return this.authService.getAccessToken({ user });
  }

  /**
   * @summary access 토큰 복구 Api
   * @description 액세스 토큰이 만료될시, 쿠키에 유지되고 있는 리프레시 토큰을 기반으로 액세스 토큰을 생성합니다
   * @param currentUser
   * @returns string
   */
  @Post('restoreAccessToken')
  @UseGuards(JwtRefreshGuard)
  // 스웨거 데코레이터
  @ApiOperation({
    description: '액세스 토큰 복구 API입니다',
    summary: '액세스 토큰 복구',
  })
  @ApiResponse({
    description: ResponseType.auth.restoreAccessToken.msg,
  })
  restoreAccessToken(
    @CurrentUser() currentUser: ICurrentUser, //
  ): Promise<string> {
    return this.authService.getAccessToken({ user: currentUser });
  }
}
