import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePostInput {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '게시글 제목', //
    example: '서울 맛집 추천!!',
  })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '게시글 내용',
    example: '종로구 부대찌개 맛집 추천드려요!',
  })
  content: string;

  @IsString()
  @ApiProperty({
    description: '게시글 해시태그',
    example: '#종로구,#부대찌개,#주말,#맛집',
  })
  hashTags: string;
}
