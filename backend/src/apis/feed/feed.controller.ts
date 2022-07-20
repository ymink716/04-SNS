import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
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
  @ApiResponse({ status: 201 })
  createFeed(
    @CurrentUser() user: ICurrentUser,
    @Body(ValidationPipe) createFeedInput: CreateFeedInput,
  ) {
    return this.feedService.create({ user, createFeedInput });
  }

  @Patch(':feedId')
  @ApiBearerAuth('access_token')
  @ApiResponse({ status: 200 })
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
}
