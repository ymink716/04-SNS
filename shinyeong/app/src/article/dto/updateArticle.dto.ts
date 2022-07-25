import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateArticleDTO {
  @ApiProperty({
    description: '게시글 제목',
    example: 'NestJS로 게시판 만들기!',
  })
  @IsString()
  @IsOptional()
  @MaxLength(80)
  @MinLength(1)
  readonly title;

  @ApiProperty({
    description: '게시글 내용',
    example: '오늘은 Nest js로 게시판을 만들어보겠습니다! blah blah',
  })
  @IsString()
  @IsOptional()
  readonly content;

  @ApiProperty({
    description: '해시태그',
    example: '#맛집,#서울,#브런치 카페,#주말',
  })
  @IsString()
  @IsOptional()
  readonly hashtag;
}
