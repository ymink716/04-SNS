import { ApiProperty } from '@nestjs/swagger';
import { Hashtags } from '../entity/hashTag.entity';

export class UpdatePostInput {
  @ApiProperty({ description: '제목', example: 'title변경', required: false })
  title?: string;

  @ApiProperty({ description: '내용', example: 'content변경', required: false })
  content?: string;

  @ApiProperty({
    description: '해시 태그',
    example: [{ tag: '인천' }, { tag: '브런치' }],
    type: [Hashtags],
    required: false,
  })
  tag?: Hashtags[];
}
