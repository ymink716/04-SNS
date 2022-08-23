import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginInput {
  @ApiProperty({ description: '이메일', example: 'test@mail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: '비밀번호 (6~20글자 영문/숫자)',
    example: 'password1234',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
