import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/user/decorator/currenUser';
import { User } from '..//user/user.entity';
import { CreatePostInput } from './dto/createPost.input';
import { filterPostDto } from './dto/filterPost.input';
import { UpdatePostInput } from './dto/updatePost.input';
import { Post as PostEntity } from './entity/post.entity';
import { LikeService } from './like.service';
import { PostService } from './post.service';

@ApiTags('SNS post')
@Controller('post')
export class PostController {
  constructor(readonly postService: PostService, readonly likeService: LikeService) {}

  // public api
  @ApiOperation({
    summary: '게시물 상세 조회 API',
  })
  @ApiBearerAuth('access_token')
  @UseGuards(AuthGuard('jwt'))
  @Get('/:postId')
  async getPost(@Param('postId') id: number): Promise<PostEntity> {
    return this.postService.getOnePost(id);
  }

  // public api
  @ApiOperation({
    summary: '게시물 목록 조회 API',
  })
  @ApiBearerAuth('access_token')
  @UseGuards(AuthGuard('jwt'))
  @Get('/')
  async posts(@Query() filter: filterPostDto): Promise<PostEntity[]> {
    return this.postService.getAllPosts(filter);
  }

  @ApiOperation({
    summary: '게시물 생성 API',
  })
  @ApiBearerAuth('access_token')
  @UseGuards(AuthGuard('jwt'))
  @Post('/')
  async createPost(@CurrentUser() user: User, @Body() input: CreatePostInput): Promise<PostEntity> {
    return this.postService.createPost(user, input);
  }

  @ApiOperation({
    summary: '게시물 수정 API',
  })
  @ApiBearerAuth('access_token')
  @UseGuards(AuthGuard('jwt'))
  @Patch('/:postId')
  async updatePost(
    @CurrentUser() user: User,
    @Param('postId') id: number,
    @Body() input: UpdatePostInput,
  ): Promise<PostEntity> {
    return this.postService.updatePost(user, id, input);
  }

  @ApiOperation({
    summary: '게시물 삭제 API',
  })
  @ApiBearerAuth('access_token')
  @UseGuards(AuthGuard('jwt'))
  @Delete('/:postId')
  async deletePost(@CurrentUser() user: User, @Param('postId') id: number): Promise<void> {
    await this.postService.deletePost(user, id);
  }

  @ApiOperation({
    summary: '삭제된 게시물 복구 API',
  })
  @Patch('/:postId/restore')
  @ApiBearerAuth('access_token')
  @UseGuards(AuthGuard('jwt'))
  async restorePost(@Param('postId', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.postService.restorePost(id, user);
  }

  @ApiOperation({
    summary: '좋아요 추가 API',
  })
  @Post('/:postId/like')
  @ApiBearerAuth('access_token')
  @UseGuards(AuthGuard('jwt'))
  async likePost(@Param('postId', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.likeService.likePost(id, user);
  }
}
