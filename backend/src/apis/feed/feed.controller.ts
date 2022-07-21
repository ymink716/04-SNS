import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, ICurrentUser } from 'src/common/auth/currentUser';
import { JwtAccessGuard } from 'src/common/auth/guard/jwtAccess.guard';

import { CreateFeedInput } from './dto/createFeed.input';
import {
  FetchFeedOptions,
  OrderByOption,
  OrderOption,
} from './dto/fetchFeed.options';
import { FetchFeedsOutput } from './dto/fetchFeed.output';

import { UpdateFeedInput } from './dto/updateFeed.input';
import { Feed } from './entities/feed.entity';

import { FeedService } from './feed.service';

@ApiTags('Feed')
@Controller({ path: 'feed', version: 'v1' })
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Post()
  @ApiOperation({
    description: '게시글 생성 Api입니다',
    summary: '게시글 생성',
  })
  @ApiBearerAuth('access_token')
  @UseGuards(JwtAccessGuard)
  createFeed(
    @CurrentUser() user: ICurrentUser,
    @Body(ValidationPipe) createFeedInput: CreateFeedInput,
  ) {
    return this.feedService.create({ user, createFeedInput });
  }

  @Patch(':feedId')
  @ApiBearerAuth('access_token')
  @ApiOperation({
    description: '게시글 수정 Api입니다',
    summary: '게시글 수정',
  })
  @ApiBody({ type: UpdateFeedInput })
  @ApiParam({ name: 'feedId', schema: { example: 1 } })
  @UseGuards(JwtAccessGuard)
  updateFeed(
    @CurrentUser() user: ICurrentUser,
    @Param('feedId') feedId: number,
    @Body(ValidationPipe) updateFeedInput: UpdateFeedInput,
  ) {
    return this.feedService.update({ feedId, user, updateFeedInput });
  }

  @Delete(':feedId')
  @ApiBearerAuth('access_token')
  @ApiResponse({
    type: String,
    description: '게시글이 성공적으로 삭제되었습니다',
    status: 200,
  })
  @ApiOperation({
    description: '게시글 삭제 Api입니다',
    summary: '게시글 삭제',
  })
  @ApiParam({ name: 'feedId', schema: { example: 1 } })
  @UseGuards(JwtAccessGuard)
  async deleteFeed(@Param('feedId') feedId: number) {
    const isDeleted: boolean = await this.feedService.delete({ feedId });
    if (isDeleted) return '게시글이 성공적으로 삭제되었습니다';
    else return Error('게시글 삭제에 실패하였습니다');
  }

  @Put(':feedId')
  @ApiBearerAuth('access_token')
  @ApiResponse({
    type: String,
    description: '게시글이 성공적으로 복구되었습니다',
    status: 200,
  })
  @ApiOperation({
    description: '게시글 복구 Api입니다',
    summary: '게시글 복구',
  })
  @ApiParam({ name: 'feedId', schema: { example: 1 } })
  @UseGuards(JwtAccessGuard)
  async restoreFeed(@Param('feedId') feedId: number) {
    const isRestored = await this.feedService.restore({ feedId });
    if (isRestored) return '게시글이 성공적으로 복구되었습니다';
    else return Error('게시글 복구에 실패하였습니다');
  }

  @Post(':feedId')
  @ApiBearerAuth('access_token')
  @ApiOperation({
    description: '게시글 좋아요 Api입니다',
    summary: '게시글 좋아요',
  })
  @UseGuards(JwtAccessGuard)
  @ApiParam({ name: 'feedId', schema: { example: 1 } })
  async toggleLike(
    @Param('feedId') feedId: number,
    @CurrentUser() user: ICurrentUser,
  ) {
    const isLike = await this.feedService.like({ user, feedId });
    console.log(isLike);
    if (isLike) return '좋아요 성공';
    else return '좋아요 취소 성공';
  }

  @Get(':feedId')
  @ApiResponse({
    type: () => Feed,
    status: 200,
    description: '게시글 상세 조회 성공',
  })
  @ApiParam({ name: 'feedId', schema: { example: 1 } })
  @ApiOperation({
    description: '게시글 상세 조회 Api입니다',
    summary: '게시글 상세 조회',
  })
  fetchFeed(@Param('feedId') feedId: number) {
    return this.feedService.findOne({ feedId });
  }

  @Get()
  @ApiResponse({
    type: FetchFeedsOutput,
    status: 200,
    description: '게시글 목록 조회 성공',
  })
  @ApiQuery({
    name: 'search',
    description: '검색어',
    example: '종로구',
    required: false,
  })
  @ApiQuery({
    name: 'order',
    enum: OrderOption,
    description: '정렬 기준',
    example: 'createdAt',
    required: false,
  })
  @ApiQuery({
    name: 'orderBy',
    enum: OrderByOption,
    description: '정렬 순서',
    example: 'DESC',
    required: false,
  })
  @ApiQuery({
    name: 'filter',
    description: '필터링할 해시태그',
    example: '맛집,주말',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    description: '조회할 페이지',
    example: 1,
    required: false,
  })
  @ApiQuery({
    name: 'pageCount',
    description: '한 페이지당 조회할 게시글 수',
    example: 10,
    required: false,
  })
  @ApiOperation({
    description: '게시글 목록 조회 Api입니다',
    summary: '게시글 목록 조회',
  })
  fetchFeeds(
    @Query('search') search?: string,
    @Query('order') order?: OrderOption,
    @Query('orderBy') orderBy?: OrderByOption,
    @Query('filter') filter?: string,
    @Query('page') page?: number,
    @Query('pageCount') pageCount?: number,
  ): Promise<FetchFeedsOutput> {
    const fetchFeedOptions: FetchFeedOptions = {
      search,
      order,
      orderBy,
      filter,
      page,
      pageCount,
    };
    return this.feedService.findList({
      ...fetchFeedOptions,
    });
  }
}
