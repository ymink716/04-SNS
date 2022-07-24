import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ description: '내용', example: '저도 추천!!' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  readonly content: string;

  @ApiProperty({ description: '게시물 id', example: 1 })
  @IsNumber()
  readonly postId: number;
}
