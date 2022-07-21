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
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, ICurrentUser } from 'src/common/auth/currentUser';
import { JwtAccessGuard } from 'src/common/auth/guard/jwtAccess.guard';
import { ErrorType } from 'src/common/error.type';
import { ResponseType } from 'src/common/response.type';

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

  // swagger
  @ApiOperation({
    description: '게시글 생성 Api입니다',
    summary: '게시글 생성',
  })
  @ApiBearerAuth('access_token')
  @ApiBody({ type: CreateFeedInput })
  @ApiCreatedResponse({
    type: () => Feed,
    description: ResponseType.createFeed.msg,
  })
  @ApiNotFoundResponse({ description: ErrorType.userNotFound.msg })
  // swagger
  @Post()
  @UseGuards(JwtAccessGuard)
  createFeed(
    @CurrentUser() user: ICurrentUser,
    @Body(ValidationPipe) createFeedInput: CreateFeedInput,
  ): Promise<Feed> {
    return this.feedService.create({ user, createFeedInput });
  }

  // swagger
  @ApiOperation({
    description: '게시글 수정 Api입니다',
    summary: '게시글 수정',
  })
  @ApiBearerAuth('access_token')
  @ApiBody({ type: UpdateFeedInput })
  @ApiParam({ name: 'feedId', schema: { example: 1 } })
  @ApiOkResponse({ type: () => Feed, description: ResponseType.updateFeed.msg })
  // swagger
  @Patch(':feedId')
  @UseGuards(JwtAccessGuard)
  updateFeed(
    @CurrentUser() user: ICurrentUser,
    @Param('feedId') feedId: number,
    @Body(ValidationPipe) updateFeedInput: UpdateFeedInput,
  ): Promise<Feed> {
    return this.feedService.update({ feedId, user, updateFeedInput });
  }

  //swagger
  @ApiOperation({
    description: '게시글 삭제 Api입니다',
    summary: '게시글 삭제',
  })
  @ApiBearerAuth('access_token')
  @ApiParam({ name: 'feedId', schema: { example: 1 } })
  @ApiOkResponse({ description: ResponseType.deleteFeed.msg })
  // swagger
  @Delete(':feedId')
  @UseGuards(JwtAccessGuard)
  async deleteFeed(@Param('feedId') feedId: number) {
    const isDeleted: boolean = await this.feedService.delete({ feedId });
    if (isDeleted) return '게시글이 성공적으로 삭제되었습니다';
    else return Error('게시글 삭제에 실패하였습니다');
  }

  //swagger
  @ApiOperation({
    description: '게시글 복구 Api입니다',
    summary: '게시글 복구',
  })
  @ApiBearerAuth('access_token')
  @ApiParam({ name: 'feedId', schema: { example: 1 } })
  @ApiOkResponse({ description: ResponseType.restoreFeed.msg })
  //swagger
  @Put(':feedId')
  @UseGuards(JwtAccessGuard)
  async restoreFeed(@Param('feedId') feedId: number) {
    const isRestored = await this.feedService.restore({ feedId });
    if (isRestored) return '게시글이 성공적으로 복구되었습니다';
    else return Error('게시글 복구에 실패하였습니다');
  }

  //swagger
  @ApiOperation({
    description: '게시글 좋아요 Api입니다',
    summary: '게시글 좋아요',
  })
  @ApiBearerAuth('access_token')
  @ApiParam({ name: 'feedId', schema: { example: 1 } })
  @ApiOkResponse({ description: ResponseType.likeFeed.msg })
  // swagger
  @Post('like/:feedId')
  @UseGuards(JwtAccessGuard)
  async toggleLike(
    @Param('feedId') feedId: number,
    @CurrentUser() user: ICurrentUser,
  ) {
    const isLike = await this.feedService.like({ user, feedId });
    console.log(isLike);
    if (isLike) return '좋아요 성공';
    else return '좋아요 취소 성공';
  }

  // swagger
  @ApiOperation({
    description: '게시글 상세 조회 Api입니다',
    summary: '게시글 상세 조회',
  })
  @ApiParam({ name: 'feedId', schema: { example: 1 } })
  @ApiOkResponse({
    type: () => Feed,
    description: ResponseType.fetchFeed.msg,
  })
  // swagger
  @Get(':feedId')
  fetchFeed(@Param('feedId') feedId: number): Promise<Feed> {
    return this.feedService.findOne({ feedId });
  }

  // swagger
  @ApiOperation({
    description: '게시글 목록 조회 Api입니다',
    summary: '게시글 목록 조회',
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
  @ApiOkResponse({
    type: FetchFeedsOutput,
    description: ResponseType.fetchFeeds.msg,
  })
  // swagger
  @Get()
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
