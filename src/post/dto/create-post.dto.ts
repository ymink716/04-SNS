import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ description: '제목', example: '맛집 추천' })
  @IsString()
  @MinLength(2)
  @IsNotEmpty()
  readonly title: string;

  @ApiProperty({ description: '내용', example: '서울 맛집 추천합니다~' })
  @IsString()
  @MaxLength(500)
  @IsNotEmpty()
  readonly content: string;

  @ApiProperty({ description: '해시태그', example: '#서울,#맛집' })
  @MinLength(2)
  @MaxLength(50)
  @IsNotEmpty()
  readonly hashtags: string;
}
