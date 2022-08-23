import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, Max, MaxLength, Min } from "class-validator";

export enum SortOption {
  CREATEDAT = 'createdAt',
  VIEWS = 'views',
  LIKECOUNT = 'likeCount',
}

export enum OrderOption {
  DESC = 'DESC',
  ASC = 'ASC',
}

export class GetPostsDto {
  @ApiProperty({ description: '정렬 조건', example: 'createdAt', nullable: true })
  @IsOptional()
  @IsEnum(SortOption)
  sort: SortOption;

  @ApiProperty({ description: '차순', example: 'DESC', nullable: true })
  @IsOptional()
  @IsEnum(OrderOption)
  order: OrderOption;

  @ApiProperty({ description: '검색어', example: '서울', nullable: true })
  @IsOptional()
  @MaxLength(50)
  search: string;

  @ApiProperty({ description: '해시태그 필터링', example: '#서울,#맛집', nullable: true })
  @IsOptional()
  @MaxLength(50)
  filter?: string;

  @ApiProperty({ description: '페이지', example: 1, default: 1, nullable: true })
  @IsOptional()
  @Min(1)
  page: number;

  @ApiProperty({ description: '개수', example: 10, default: 10, nullable: true })
  @IsOptional()
  @Min(1)
  @Max(50)
  take: number;
}

