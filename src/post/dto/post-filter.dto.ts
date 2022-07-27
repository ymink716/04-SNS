import { ApiProperty } from "@nestjs/swagger";

export class PostFilterDto {
  @ApiProperty({ description: '정렬 조건', required: false })
  sort?: SortOption;

  @ApiProperty({ description: '오름차순/내림차순', required: false })
  order?: OrderOption;

  @ApiProperty({ description: '검색 조건', required: false })
  search?: string;

  @ApiProperty({ description: '해시태그 필터', required: false })
  filter?: string;

  @ApiProperty({ description: '페이지', default: 1, required: false })
  page?: number;

  @ApiProperty({ description: '개수', default: 10, required: false })
  take?: number;
}

export enum SortOption {
    CREATEDAT = 'createdAt',
    VIEWS = 'views',
    likes = 'likes',
  }
  
  export enum OrderOption {
    DESC = 'DESC',
    ASC = 'ASC',
  }