import { Controller, Post } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/user/decorator/currenUser';
import { User } from 'src/user/user.entity';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(readonly authService: AuthService) {
    return this;
  }
  @ApiExcludeEndpoint()
  @Post('refreshToken')
  async refreshToken(@CurrentUser() user: User): Promise<string> {
    return this.authService.generateToken(user);
  }
}
