import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ResponseType } from 'src/utils/response.enum';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';
import { defaultTokenOption } from './token-option.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * @description 사용자를 생성하여 회원가입을 처리
  */
  @Post('/signup')
  @ApiBody({ type: SignUpDto })
  @ApiCreatedResponse({ description: ResponseType.createUser.message })
  async signUp(@Body() signUpDto: SignUpDto) {
    const user = await this.authService.signUp(signUpDto);

    return user;
  }

  /**
   * @description access token, resfresh token 발급하여 로그인 처리
   * [TODO] refresh token 처리
  */
  @ApiBody({ type: SignInDto })
  @ApiCreatedResponse({ description: ResponseType.loginUser.message })
  @Post('/signin')
  async signIn(@Res({ passthrough: true }) res: Response, @Body() signInDto: SignInDto) {
    const { accessToken } = await this.authService.signIn(signInDto);
   
    res.cookie('Authentication', accessToken, defaultTokenOption);

    return { accessToken };
  }
}
