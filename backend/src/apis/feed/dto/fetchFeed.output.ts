import { ApiProperty } from '@nestjs/swagger';
import { Feed } from '../entities/feed.entity';

export class FetchFeedsOutput {
  @ApiProperty({ description: '게시글 목록' })
  feeds: Feed[];
  @ApiProperty({ description: '조회한 페이지 번호' })
  page: number;
  @ApiProperty({ description: '한 페이지당 게시글 개수' })
  pageCount: number;
  @ApiProperty({ description: '총 개수' })
  total: number;
  @ApiProperty({ description: '검색어' })
  search: string;
  @ApiProperty({ description: '필터링한 해시태그 목록' })
  filter: string[];
}
