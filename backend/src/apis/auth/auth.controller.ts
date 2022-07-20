import {
  Body,
  Controller,
  Post,
  Res,
  UnprocessableEntityException,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentUser, ICurrentUser } from 'src/common/auth/currentUser';
import { JwtRefreshGuard } from 'src/common/auth/guard/jwtRefresh.guard';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { loginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @ApiBody({ type: loginDto })
  @ApiResponse({ type: String, description: '로그인 성공!', status: 201 })
  @ApiOperation({ description: '로그인 API입니다', summary: '로그인' })
  @Post('login')
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body(ValidationPipe) loginDto: loginDto,
  ) {
    const { email, password } = loginDto;
    const user = await this.userService.fetch({ email });

    const isAuth = this.authService.validatePassword({
      plainPW: password,
      hashedPW: user.password,
    });
    if (!isAuth)
      throw new UnprocessableEntityException('비밀번호를 다시 확인하세요');

    await this.authService.setRefreshToken({ user, res });
    return this.authService.getAccessToken({ user });
  }

  @UseGuards(JwtRefreshGuard)
  @ApiOperation({
    description: 'Access 토큰 복구 API입니다',
    summary: 'Access 토큰 복구',
  })
  @ApiResponse({
    type: String,
    description: 'Access 토큰 복구 성공!',
    status: 201,
  })
  @Post('restoreAccessToken')
  restoreAccessToken(
    @CurrentUser() currentUser: ICurrentUser, //
  ) {
    return this.authService.getAccessToken({ user: currentUser });
  }
}
