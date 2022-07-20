import {
  Body,
  Controller,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, ICurrentUser } from 'src/common/auth/currentUser';
import { JwtAccessGuard } from 'src/common/auth/guard/jwtAccess.guard';
import { CreatePostInput } from './dto/createPost.input';

import { PostService } from './post.service';

@ApiTags('Post')
@Controller({ path: 'post', version: 'v1' })
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @ApiBearerAuth('access_token')
  @ApiOperation({
    description: '게시글 생성 Api입니다',
    summary: '게시글 생성',
  })
  @UseGuards(JwtAccessGuard)
  createPost(
    @CurrentUser() user: ICurrentUser,
    @Body(ValidationPipe) createPostInput: CreatePostInput,
  ) {
    return this.postService.create({ user, createPostInput });
  }
}
