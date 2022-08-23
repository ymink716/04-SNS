import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { User } from 'src/user/entity/user.entity';
import { UserService } from 'src/user/user.service';
import { GetUser } from 'src/common/custom-decorator/get-user.decorator'; 
import { ResponseType } from 'src/common/response/response-type.enum'; 
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtRefreshGuard } from './guard/jwt-refresh.guard';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { defaultTokenOption } from './token-option.interface';
import { AuthResponse, LoginResponseData, RegisterResponseData } from './dto/auth-response';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  /**
   * @description 사용자를 생성하여 회원가입을 처리
  */
  @ApiBody({ type: CreateUserDto })
  @ApiOperation({ description: '회원 가입 API', summary: '회원 가입' })
  @ApiCreatedResponse({ 
    description: ResponseType.registerUser.message, 
    type: RegisterResponseData 
  })
  @Post('/register')
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.register(createUserDto);

    return AuthResponse.response(
      ResponseType.registerUser.code,
      ResponseType.registerUser.message,
      user.toJSON(),
    );
  }

  /**
   * @description access token, resfresh token 발급하여 로그인 처리
  */
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ description: '로그인 API', summary: '로그인' })
  @ApiBody({ type: LoginUserDto })
  @ApiCreatedResponse({ 
    description: ResponseType.loginUser.message, 
    type: LoginResponseData, 
  })
  @Post('/login')
  async login(@Res({ passthrough: true }) res: Response, @GetUser() user: User) {
    const { accessToken, accessOption, refreshToken, refreshOption } 
      = await this.authService.getTokens(user.email);

    await this.userService.setRefreshToken(refreshToken, user.email);

    res.cookie('Authentication', accessToken, accessOption);
    res.cookie('Refresh', refreshToken, refreshOption);
    
    return AuthResponse.response(
      ResponseType.loginUser.code,
      ResponseType.loginUser.message,
      { user: user.toJSON(), accessToken },
    );
  }

  /**
   * @description 토큰을 제거하여 로그아웃 기능 구현
  */
  @ApiBearerAuth('access_token')
  @ApiOperation({ description: '로그아웃 API', summary: '로그아웃' })
  @ApiCreatedResponse({ description: ResponseType.logoutUser.message })
  @UseGuards(JwtRefreshGuard)
  @Post('/logout')
  async logout(@Res({ passthrough: true }) res: Response, @GetUser() user: User) {
    const { accessOption, refreshOption } = this.authService.getCookiesForLogOut();

    await this.userService.removeRefreshToken(user.id);

    res.cookie('Authentication', '', accessOption);
    res.cookie('Refresh', '', refreshOption);

    return AuthResponse.response(
      ResponseType.logoutUser.code,
      ResponseType.logoutUser.message,
    );
  }

  /**
   * @description 리프레시 토큰으로 액세스 토큰 재요청
  */
  @UseGuards(JwtRefreshGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ 
    description: 'refresh token으로 access token을 재발급', 
    summary: 'refresh token 확인' 
  })
  @ApiResponse({ description: ResponseType.refreshTokenWithUser.message })
  @Get('/accessToken')
  async refreshToken(@GetUser() user: User, @Res({ passthrough: true }) res: Response) {
    const { accessToken } = await this.authService.getCookieWithAccessToken(user.email);
    const accessOption = defaultTokenOption;

    res.cookie('Authentication', accessToken, accessOption);
    
    return AuthResponse.response(
      ResponseType.refreshTokenWithUser.code,
      ResponseType.refreshTokenWithUser.message,
      { user: user.toJSON(), accessToken },
    )
  }
}
