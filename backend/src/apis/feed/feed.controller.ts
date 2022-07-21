import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, ICurrentUser } from 'src/common/auth/currentUser';
import { JwtAccessGuard } from 'src/common/auth/guard/jwtAccess.guard';

import { CreateFeedInput } from './dto/createFeed.input';

import { UpdateFeedInput } from './dto/updateFeed.input';

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
}
