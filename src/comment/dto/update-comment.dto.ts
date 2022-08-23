import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({ description: '내용', example: '저도 추천!!(수정)' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  readonly content: string;
}
