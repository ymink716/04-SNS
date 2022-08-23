import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UnprocessableEntityException,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CurrentUser, ICurrentUser } from 'src/common/auth/currentUser';
import { JwtAccessGuard } from 'src/common/auth/guard/jwtAccess.guard';
import { ErrorType } from 'src/common/type/error.type';
import { ResponseType } from 'src/common/type/response.type';

import { CreateFeedInput } from './dto/createFeed.input';
import {
  FetchFeedOptions,
  OrderOption,
  SortOption,
} from './dto/fetchFeed.options';
import { FetchFeedsOutput } from './dto/fetchFeed.output';

import { UpdateFeedInput } from './dto/updateFeed.input';
import { Feed } from './entities/feed.entity';

import { FeedService } from './feed.service';

@ApiTags('Feed')
@Controller({ path: 'feed', version: 'v1' })
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  /**
   * @summary 게시글 생성 api
   * @param currentUser
   * @param createFeedInput
   * @returns `Feed`
   */
  @Post()
  @UseGuards(JwtAccessGuard)
  // 스웨거 데코레이터
  @ApiOperation({
    description: '게시글 생성 Api입니다',
    summary: '게시글 생성',
  })
  @ApiBearerAuth('access_token')
  @ApiBody({ type: CreateFeedInput })
  @ApiCreatedResponse({
    type: () => Feed,
    description: ResponseType.feed.create.msg,
  })
  @ApiUnauthorizedResponse({ description: ErrorType.auth.unauthorized.msg })
  createFeed(
    @CurrentUser() currentUser: ICurrentUser,
    @Body(ValidationPipe) createFeedInput: CreateFeedInput,
  ): Promise<Feed> {
    return this.feedService.create({ currentUser, createFeedInput });
  }

  /**
   * @summary 게시글 수정 api
   * @param currentUser
   * @param feedId
   * @param updateFeedInput
   * @returns `Feed`
   */
  @Patch(':feedId')
  @UseGuards(JwtAccessGuard)
  @ApiOperation({
    description: '게시글 수정 Api입니다',
    summary: '게시글 수정',
  })
  // 스웨거 데코레이터
  @ApiBearerAuth('access_token')
  @ApiBody({ type: UpdateFeedInput })
  @ApiParam({ name: 'feedId', schema: { example: 1 } })
  @ApiOkResponse({
    type: () => Feed,
    description: ResponseType.feed.update.msg,
  })
  @ApiNotFoundResponse({ description: ErrorType.feed.notFound.msg })
  @ApiUnauthorizedResponse({ description: ErrorType.auth.unauthorized.msg })
  @ApiForbiddenResponse({ description: ErrorType.feed.notYours.msg })
  updateFeed(
    @CurrentUser() currentUser: ICurrentUser,
    @Param('feedId') feedId: number,
    @Body(ValidationPipe) updateFeedInput: UpdateFeedInput,
  ): Promise<Feed> {
    return this.feedService.update({ feedId, currentUser, updateFeedInput });
  }

  /**
   * @summary 게시글 삭제 api
   * @param feedId
   * @param currentUser
   * @returns string
   */
  @Delete(':feedId')
  @UseGuards(JwtAccessGuard)
  // 스웨거 데코레이터
  @ApiOperation({
    description: '게시글 삭제 Api입니다',
    summary: '게시글 삭제',
  })
  @ApiBearerAuth('access_token')
  @ApiParam({ name: 'feedId', schema: { example: 1 } })
  @ApiOkResponse({ description: ResponseType.feed.delete.msg })
  @ApiNotFoundResponse({ description: ErrorType.feed.notFound.msg })
  @ApiUnprocessableEntityResponse({ description: ErrorType.feed.delete.msg })
  @ApiUnauthorizedResponse({ description: ErrorType.auth.unauthorized.msg })
  @ApiForbiddenResponse({ description: ErrorType.feed.notYours.msg })
  async deleteFeed(
    @CurrentUser() currentUser: ICurrentUser,
    @Param('feedId') feedId: number,
  ): Promise<string> {
    const isDeleted: boolean = await this.feedService.delete({
      currentUser,
      feedId,
    });
    if (isDeleted) return ResponseType.feed.delete.msg;
    else throw new UnprocessableEntityException(ErrorType.feed.delete.msg);
  }

  /**
   * @summary 게시글 복구 api
   * @param feedId
   * @returns string
   */
  @Put(':feedId')
  @UseGuards(JwtAccessGuard)
  // 스웨거 데코레이터
  @ApiOperation({
    description: '게시글 복구 Api입니다',
    summary: '게시글 복구',
  })
  @ApiBearerAuth('access_token')
  @ApiParam({ name: 'feedId', schema: { example: 1 } })
  @ApiOkResponse({
    description: ResponseType.feed.restore.msg,
  })
  @ApiNotFoundResponse({ description: ErrorType.feed.notFound.msg })
  @ApiUnauthorizedResponse({ description: ErrorType.auth.unauthorized.msg })
  @ApiForbiddenResponse({ description: ErrorType.feed.notYours.msg })
  async restoreFeed(
    @CurrentUser() currentUser: ICurrentUser,
    @Param('feedId') feedId: number,
  ) {
    const isRestored = await this.feedService.restore({ currentUser, feedId });
    if (isRestored) return ResponseType.feed.restore.msg;
    else throw new NotFoundException(ErrorType.feed.restore.msg);
  }

  /**
   * @summary 게시글 좋아요 Api
   * @param feedId
   * @param currentUser
   * @returns string
   */
  @Post('like/:feedId')
  @UseGuards(JwtAccessGuard)
  // 스웨거 데코레이터
  @ApiOperation({
    description: '게시글 좋아요 Api입니다',
    summary: '게시글 좋아요',
  })
  @ApiBearerAuth('access_token')
  @ApiParam({ name: 'feedId', schema: { example: 1 } })
  @ApiCreatedResponse({ description: ResponseType.feed.like.msg })
  @ApiNotFoundResponse({ description: ErrorType.feed.notFound.msg })
  @ApiUnauthorizedResponse({ description: ErrorType.auth.unauthorized.msg })
  async toggleLike(
    @Param('feedId') feedId: number,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    const isLike = await this.feedService.like({ currentUser, feedId });
    if (isLike) return ResponseType.feed.like.msg;
    else return ResponseType.feed.cancelLike.msg;
  }

  /**
   * @summary 게시글 상세 조회 Api
   * @description 상세 조회 Api 호출시 queryBus를 통해 조회수가 증가합니다
   * @param feedId
   * @returns `Feed`
   */
  @Get(':feedId')
  // 스웨거 데코레이터
  @ApiOperation({
    description: '게시글 상세 조회 Api입니다',
    summary: '게시글 상세 조회',
  })
  @ApiParam({ name: 'feedId', schema: { example: 1 } })
  @ApiOkResponse({
    type: () => Feed,
    description: ResponseType.feed.fetch.msg,
  })
  @ApiNotFoundResponse({ description: ErrorType.feed.notFound.msg })
  fetchFeed(@Param('feedId') feedId: number): Promise<Feed> {
    return this.feedService.findOne({ feedId });
  }

  /**
   * @summary 게시글 목록 검색 조회 Api
   * @description 옵션에 따라 게시글을 검색 조회합니다 해시태그는 sql 와일드카드를 이용해 검색합니다
   * @param search
   * @param sort
   * @param order
   * @param filter
   * @param page
   * @param pageCount
   * @returns `Feed[]`
   */
  @Get()
  // 스웨거 데코레이터
  @ApiOperation({
    description: '게시글 목록 검색 조회 Api입니다',
    summary: '게시글 목록 검색 조회',
  })
  @ApiQuery({
    name: 'search',
    description: '검색어',
    example: '종로구',
    required: false,
  })
  @ApiQuery({
    name: 'sort',
    enum: SortOption,
    description: '정렬 기준',
    example: 'createdAt',
    required: false,
  })
  @ApiQuery({
    name: 'order',
    enum: OrderOption,
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
    description: ResponseType.feed.fetches.msg,
  })
  fetchFeeds(
    @Query('search') search?: string,
    @Query('sort') sort?: SortOption,
    @Query('order') order?: OrderOption,
    @Query('filter') filter?: string,
    @Query('page') page?: number,
    @Query('pageCount') pageCount?: number,
  ): Promise<FetchFeedsOutput> {
    const fetchFeedOptions: FetchFeedOptions = {
      search,
      sort,
      order,
      filter,
      page,
      pageCount,
    };
    return this.feedService.findList({
      ...fetchFeedOptions,
    });
  }
}
