import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { ResponseType } from 'src/utils/response.enum';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';

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
    const result = await this.authService.signUp(signUpDto);

    return result;
  }
}
