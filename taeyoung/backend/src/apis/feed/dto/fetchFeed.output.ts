import { ApiProperty } from '@nestjs/swagger';
import { Feed } from '../entities/feed.entity';
import { OrderOption, SortOption } from './fetchFeed.options';

export class FetchFeedsOutput {
  @ApiProperty({ type: () => [Feed], description: '게시글 목록' })
  feeds: Feed[];

  @ApiProperty({ description: '조회한 페이지 번호', default: 1 })
  page: number;

  @ApiProperty({ description: '한 페이지당 게시글 개수', default: 10 })
  pageCount: number;

  @ApiProperty({ description: '총 개수', example: 13 })
  total: number;

  @ApiProperty({ description: '검색어', example: '종로구' })
  search: string;

  @ApiProperty({
    example: ['맛집', '주말'],
    isArray: true,
    description: '필터링한 해시태그 목록',
  })
  filter: string[];

  @ApiProperty({ description: '정렬 기준', example: SortOption.CREATEDAT })
  sort: SortOption;

  @ApiProperty({ description: '정렬 기준', example: OrderOption.DESC })
  order: OrderOption;
}
