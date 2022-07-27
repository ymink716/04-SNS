import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, Max, Min } from "class-validator";

export enum SortOption {
  CREATEDAT = 'createdAt',
  VIEWS = 'views',
  likes = 'likes',
}

export enum OrderOption {
  DESC = 'DESC',
  ASC = 'ASC',
}

export class GetPostsDto {
  @ApiProperty({ description: '정렬 조건', example: 'createdAt' })
  @IsEnum(SortOption)
  sort?: SortOption;

  @ApiProperty({ description: '차순', example: 'DESC' })
  @IsEnum(OrderOption)
  order?: OrderOption;

  @ApiProperty({ description: '검색어', example: '서울' })
  search?: string;

  @ApiProperty({ description: '해시태그 필터링', example: '#서울,#맛집' })
  filter?: string;

  @ApiProperty({ description: '페이지', example: 1 })
  @Min(1)
  page?: number;

  @ApiProperty({ description: '개수', example: 10 })
  @Min(1)
  @Max(50)
  take?: number;
}

