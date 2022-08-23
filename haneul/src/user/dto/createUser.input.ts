import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserInput {
  //   name: string;

  @ApiProperty({ description: '이메일', example: 'test@mail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: '비밀번호 (6~20글자 영문/숫자)',
    example: 'password1234',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: '비밀번호는 6~20글자 사이의 영문과 숫자만 가능합니다.',
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: '비밀번호 확인 (6~20글자 영문/숫자)',
    example: 'password1234',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: '비밀번호는 6~20글자 사이의 영문과 숫자만 가능합니다.',
  })
  @IsNotEmpty()
  confirmPassword: string;
}
