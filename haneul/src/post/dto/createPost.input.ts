import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Hashtags } from '../entity/hashTag.entity';

export class CreatePostInput {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '제목', example: 'title' })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '내용', example: 'content' })
  content: string;

  @IsNotEmpty()
  @ApiProperty({
    description: '해시 태그',
    example: [{ tag: '서울' }, { tag: '맛집' }],
    type: [Hashtags],
  })
  tag: Hashtags[];
}
