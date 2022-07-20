import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { UserService } from './user.service';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';

@ApiTags('User')
@Controller({ path: 'user', version: 'v1' })
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ description: '회원가입 API입니다', summary: '회원가입' })
  @ApiBadRequestResponse({
    status: 400,
    description: '비밀번호가 일치하지 않습니다',
  })
  @ApiUnprocessableEntityResponse({
    status: 422,
    description: '이미 가입된 이메일 입니다',
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: '비밀번호 해싱 에러',
  })
  @ApiResponse({ type: User, description: '회원가입 성공', status: 201 })
  createUser(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
  ): Promise<User> {
    return this.userService.signup({ createUserDto });
  }
}
