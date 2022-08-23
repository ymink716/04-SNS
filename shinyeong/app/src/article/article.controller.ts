import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import { GetUser } from 'src/utils/helper/getUserDecorator';
import { MSG } from 'src/utils/responseHandler/response.enum';
import { ArticleService } from './service/article.service';
import { CommentService } from './service/comment.service';
import { DefaultResponse } from './dto/article.response';
import { CreateArticleDTO } from './dto/createArticle.dto';
import { CreateCommentDto } from './dto/createComment.dto';
import { orderByOption, orderOption } from './dto/getArticleList.dto';
import { UpdateArticleDTO } from './dto/updateArticle.dto';
import { LikeService } from './service/like.service';
import { UpdateCommentDto } from './dto/updateComment.dto';

@ApiTags('Articles')
@Controller('articles')
export class ArticleController {
  constructor(
    private readonly articleService: ArticleService,
    private readonly likeService: LikeService,
    private readonly commentService: CommentService,
  ) {}

  /**
   * @description 게시글 상세 내용 요청
   * */
  @ApiResponse({ description: MSG.getOneArticle.msg })
  @Get('/:id')
  async getOneArticle(@Param('id') articleId: number): Promise<object> {
    const result = await this.articleService.getArticle(articleId);
    return DefaultResponse.response(
      result,
      MSG.getOneArticle.code,
      MSG.getOneArticle.msg,
    );
  }

  /**
   * @description 게시글 리스트 요청
   * */
  @ApiQuery({
    name: 'search',
    description: '검색어',
    example: '영화',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: '조회할 게시글의 수',
    example: 10,
    required: false,
  })
  @ApiQuery({
    name: 'offset',
    description: '조회할 페이지',
    example: 0,
    required: false,
  })
  @ApiQuery({
    name: 'order',
    description: '정렬 방식(오름차순, 내림차순 둘 중 하나)',
    example: 'DESC',
    required: false,
  })
  @ApiQuery({
    name: 'orderBy',
    description: '정렬 기준(작성일, 좋아요 수, 조회수)',
    example: 'CreatedAt',
    required: false,
  })
  @ApiQuery({
    name: 'filter',
    description: '해시태그로 필터링',
    example: '서울,맛집',
    required: false,
  })
  @ApiResponse({ description: MSG.getArticleList.msg })
  @Get()
  async getArticleList(
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('order') order?: orderOption,
    @Query('orderBy') orderBy?: orderByOption,
    @Query('filter') filter?: string,
  ): Promise<object> {
    const result = await this.articleService.getArticleList({
      search,
      limit,
      offset,
      order,
      orderBy,
      filter,
    });
    return DefaultResponse.response(
      result,
      MSG.getArticleList.code,
      MSG.getArticleList.msg,
    );
  }

  /**
   * @description 게시글 생성
   * */
  @ApiBody({ type: CreateArticleDTO })
  @ApiCreatedResponse({ description: MSG.createArticle.msg })
  @ApiBearerAuth('access_token')
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createArticle(
    @Body() createArticleData: CreateArticleDTO,
    @GetUser() user: User,
  ) {
    const result = await this.articleService.createArticle(
      createArticleData,
      user,
    );
    return DefaultResponse.response(
      result,
      MSG.createArticle.code,
      MSG.createArticle.msg,
    );
  }

  /**
   * @description 게시글 수정
   * */
  @ApiCreatedResponse({ description: MSG.deleteArticle.msg })
  @ApiBearerAuth('access_token')
  @UseGuards(AuthGuard('jwt'))
  @Patch('/:id')
  async updateArticle(
    @Param('id') articleId: number,
    @Body() updateArticleData: UpdateArticleDTO,
    @GetUser() user: User,
  ) {
    const result = await this.articleService.updateArticle(
      articleId,
      updateArticleData,
      user,
    );
    return DefaultResponse.response(
      result,
      MSG.updateArticle.code,
      MSG.updateArticle.msg,
    );
  }

  /**
   * @description 게시글 삭제
   * */

  @ApiCreatedResponse({ description: MSG.deleteArticle.msg })
  @ApiBearerAuth('access_token')
  @UseGuards(AuthGuard('jwt'))
  @Delete('/:id')
  async deleteArticle(@Param('id') articleId: number, @GetUser() user: User) {
    const result = await this.articleService.deleteArticle(articleId, user);
    return DefaultResponse.response(
      result,
      MSG.deleteArticle.code,
      MSG.deleteArticle.msg,
    );
  }

  /**
   * @description 게시글 복구
   * */

  @ApiCreatedResponse({ description: MSG.restoreArticle.msg })
  @ApiBearerAuth('access_token')
  @UseGuards(AuthGuard('jwt'))
  @Patch('restoration/:id')
  async restoreArticle(@Param('id') articleId: number, @GetUser() user: User) {
    const result = await this.articleService.restoreArticle(articleId, user);
    return DefaultResponse.response(
      result,
      MSG.restoreArticle.code,
      MSG.restoreArticle.msg,
    );
  }

  /**
   * @description 게시글 좋아요 요청
   * */
  @ApiCreatedResponse({ description: MSG.likeArticle.msg })
  @ApiBearerAuth('access_token')
  @UseGuards(AuthGuard('jwt'))
  @Post('/like/:id')
  async likeArticle(@Param('id') articleId: number, @GetUser() user: User) {
    const result = await this.likeService.likeArticle(articleId, user);
    return DefaultResponse.response(
      result,
      MSG.likeArticle.code,
      MSG.likeArticle.msg,
    );
  }

  /**
   * @description 게시글 좋아요 취소 요청
   * */
  @ApiResponse({ description: MSG.unlikeArticle.msg })
  @ApiBearerAuth('access_token')
  @UseGuards(AuthGuard('jwt'))
  @Delete('/like/:id')
  async unlikeArticle(@Param('id') articleId: number, @GetUser() user: User) {
    const result = await this.likeService.unLikeArticle(articleId, user);
    return DefaultResponse.response(
      result,
      MSG.unlikeArticle.code,
      MSG.unlikeArticle.msg,
    );
  }

  /**
   * @description 게시글 좋아요 누른 사람 목록 요청
   * */

  @ApiResponse({ description: MSG.getUsersLike.msg })
  @Get('/like/:id')
  async getUsersLike(@Param('id') articleId: number) {
    const result = await this.likeService.getUsersPushLike(articleId);
    return DefaultResponse.response(
      result,
      MSG.getUsersLike.code,
      MSG.getUsersLike.msg,
    );
  }

  /**
   * @description 게시글 댓글 생성 요청
   * */

  @ApiCreatedResponse({ description: MSG.createComment.msg })
  @ApiBody({
    type: CreateCommentDto,
  })
  @UseGuards(AuthGuard('jwt'))
  @Post('/comments/:id')
  async createComment(
    @Param('id') articleId: number,
    @Body() commentDto: CreateCommentDto,
    @GetUser() user: User,
  ) {
    const result = await this.commentService.createComment(
      articleId,
      commentDto,
      user,
    );

    return DefaultResponse.response(
      result,
      MSG.createComment.code,
      MSG.createComment.msg,
    );
  }

  /**
   * @description 게시글 댓글 삭제 요청
   * */
  @ApiResponse({ description: MSG.deleteComment.msg })
  @UseGuards(AuthGuard('jwt'))
  @Delete('/comments/:comment_id')
  async deleteComment(
    @Param('comment_id') commentId: number,
    @GetUser() user: User,
  ) {
    const result = await this.commentService.softDeleteComment(commentId, user);
    return DefaultResponse.response(
      result,
      MSG.deleteComment.code,
      MSG.deleteComment.msg,
    );
  }

  /**
   * @description 게시글 댓글 수정 요청
   * */
  @ApiResponse({ description: MSG.updateComment.msg })
  @UseGuards(AuthGuard('jwt'))
  @Patch('/comments/:comment_id')
  async updatecomment(
    @Param('comment_id') commentId: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @GetUser() user: User,
  ) {
    const result = await this.commentService.updateComment(
      commentId,
      updateCommentDto,
      user,
    );
    return DefaultResponse.response(
      result,
      MSG.updateComment.code,
      MSG.updateComment.msg,
    );
  }
}
