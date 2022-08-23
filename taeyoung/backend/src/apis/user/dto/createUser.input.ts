import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserInput {
  @IsEmail({ message: '유효하지 않은 이메일 주소입니다' })
  @IsNotEmpty()
  @ApiProperty({ description: '유저의 이메일 주소', example: 'test@mail.com' })
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @ApiProperty({
    description: '유저의 비밀번호 (6~20글자 영문/숫자)',
    example: 'password1234',
  })
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: '비밀번호는 6~20글자에 영문과 숫자만 가능합니다.',
  })
  password: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @ApiProperty({
    description: '유저의 비밀번호 (6~20글자 영문/숫자)',
    example: 'password1234',
  })
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: '비밀번호는 6~20글자에 영문과 숫자만 가능합니다.',
  })
  passwordConfirm: string;
}
