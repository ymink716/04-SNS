import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { GetUser } from 'src/utils/get-user.decorator';
import { ResponseType } from 'src/utils/response.enum';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtRefreshGuard } from './guard/jwt-refresh.guard';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { defaultTokenOption } from './token-option.interface';

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
  @Post('/user/register')
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({ description: ResponseType.createUser.message })
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.register(createUserDto);

    return user;
  }

  /**
   * @description access token, resfresh token 발급하여 로그인 처리
  */
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginUserDto })
  @Post('/login')
  async login(@Res({ passthrough: true }) res: Response, @GetUser() user: User) {
    const { accessToken, accessOption, refreshToken, refreshOption } = await this.authService.getTokens(user.email);

    await this.userService.setRefreshToken(refreshToken, user.email);

    res.cookie('Authentication', accessToken, accessOption);
    res.cookie('Refresh', refreshToken, refreshOption);
    
    return { accessToken, user }
  }

  /**
   * @description 토큰을 제거하여 로그아웃 기능 구현
  */
  @ApiBearerAuth('access_token')
  @ApiCreatedResponse({ description: '성공' })
  @UseGuards(JwtRefreshGuard)
  @Post('/logout')
  async logout(@Res({ passthrough: true }) res: Response, @GetUser() user: User) {
    const { accessOption, refreshOption } = this.authService.getCookiesForLogOut();

    await this.userService.removeRefreshToken(user.id);

    res.cookie('Authentication', '', accessOption);
    res.cookie('Refresh', '', refreshOption);
  }

  /**
   * @description 리프레시 토큰으로 액세스 토큰 재요청
  */
  @UseGuards(JwtRefreshGuard)
  @ApiBearerAuth('access_token')
  @Get('/refreshToken')
  async refreshToken(@GetUser() user: User, @Res({ passthrough: true }) res: Response) {
    const { accessToken } = await this.authService.getCookieWithAccessToken(user.email);
    const accessOption = defaultTokenOption;

    res.cookie('Authentication', accessToken, accessOption);
    
    return { accessToken, user };
  }
}
