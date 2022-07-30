import { ApiProperty } from '@nestjs/swagger';

export class filterPostDto {
  // searching (검색) - 제목 기준 (해당 검색어를 포함하는 것만 노출)
  @ApiProperty({ description: '검색어 (기본 값은 비워서 보냅니다.)', nullable: true, required: false })
  keyword?: Array<string>;

  // filtering - 해시 태그 (명확하게 일치하는 것만 노출)
  @ApiProperty({
    description: '해시태그 (기본 값은 비워서 보냅니다.)',
    nullable: true,
    required: false,
  })
  tag?: Array<string>;

  // ordering (정렬) - 기본 작성일 기준 내림차 순
  @ApiProperty({
    description: 'DESC(내림차 순)/ASC(오름차 순) 중 선택할 수 있습니다',
    example: 'DESC',
    default: 'DESC',
    nullable: true,
    required: false,
  })
  sortedType?: string;

  // pagination (페이징) - limit과 offset에 해당.
  @ApiProperty({ nullable: true, required: false, default: 5 })
  take?: number;

  @ApiProperty({ nullable: true, required: false, default: 0 })
  skip?: number;
}
