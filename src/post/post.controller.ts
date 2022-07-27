import { Body, Controller, Delete, Get, Ip, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { User } from 'src/user/entity/user.entity';
import { AllowAny } from 'src/common/custom-decorator/allow-any.decorator'; 
import { GetUser } from 'src/common/custom-decorator/get-user.decorator'; 
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { HashtagService } from './hashtag.service';
import { PostHashtagService } from './post-hashtag.service';
import { PostService } from './post.service';
import { OrderOption, SortOption } from './dto/get-posts.dto';
import { PostViewLogService } from './post-view-log.service';
import { PostResponse, PostResponseData, PostDetailResponseData, PostListResponseData } from './dto/post-response';
import { ResponseType } from 'src/common/type/response-type.enum';
import { PostFilterDto } from './dto/post-filter.dto';
import { CommentService } from 'src/comment/comment.service';

@ApiTags('posts')
@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly hashtagService: HashtagService,
    private readonly postHashtagService: PostHashtagService,
    private readonly postViewLogservice: PostViewLogService,
    private readonly commentService: CommentService,
  ) {}

  /**
   * @description 게시물 생성 API
   * - 해시태그 리스트를 생성합니다.
   * - 게시물을 생성합니다.
   * - 게시물과 해시태그의 관계를 연결합니다.
  */
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: '게시물 생성 ', description: '게시물 생성 API' })
  @ApiBody({ type: CreatePostDto })
  @ApiCreatedResponse({ description: ResponseType.createPost.message, type: PostResponseData })
  @Post()
  async createPost(@Body() createPostDto: CreatePostDto, @GetUser() user: User) {
    const { hashtags } = createPostDto;
  
    const hashtagList = await this.hashtagService.createHashtagList(hashtags);
    const post = await this.postService.createPost(createPostDto, user);

    await this.postHashtagService.createPostHashtags(hashtagList, post);

    return PostResponse.response(
      ResponseType.createPost.code,
      ResponseType.createPost.message,
      post,
    );
  }

  /**
   * @description 게시물 수정 API
   * - 변경된 해시태그 리스트를 생성합니다.
   * - 게시물을 업데이트합니다.
   * - 이전 해시태그와 게시물 관계를 제거합니다.
   * - 변경된 해시태그와 게시물 관계를 저장합니다.
  */
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: '게시물 수정 ', description: '게시물 수정 API '})
  @ApiBody({ type: UpdatePostDto })
  @ApiOkResponse({ description: ResponseType.updatePost.message, type: PostResponseData })
  @Put('/:postId')
  async updatePost(
    @Body() updatePostDto: UpdatePostDto, 
    @GetUser() user: User,
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    const { hashtags } = updatePostDto;
    
    const hashtagList = await this.hashtagService.createHashtagList(hashtags);
    const post = await this.postService.updatePost(postId, updatePostDto, user);

    await this.postHashtagService.deletePostHashtagByPost(post);
    await this.postHashtagService.createPostHashtags(hashtagList, post);

    return PostResponse.response(
      ResponseType.updatePost.code,
      ResponseType.updatePost.message,
      post,
    );
  }

  /**
   * @description 게시물 삭제 API
   * - 작성자가 게시물을 삭제합니다.
  */
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: '게시물 삭제 ', description: '게시물 삭제 API '})
  @ApiOkResponse({ description: ResponseType.deletePost.message })
  @Delete('/:postId')
  async deletePost(
    @Param('postId', ParseIntPipe) postId: number,
    @GetUser() user: User,
  ) {
    await this.postService.deletePost(postId, user);

    return PostResponse.response(
      ResponseType.deletePost.code,
      ResponseType.deletePost.message,
    );
  }

  /**
   * @description 게시물 복구 API
   * - 작성자가 삭제된 게시물을 복구합니다.
  */
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: '게시물 복구 ', description: '게시물 복구 API '})
  @ApiOkResponse({ description: ResponseType.restorePost.message })
  @Put('/restore/:postId')
  async restorePost(
    @Param('postId', ParseIntPipe) postId: number,
    @GetUser() user: User,
  ) {
    await this.postService.restorePost(postId, user);

    return PostResponse.response(
      ResponseType.restorePost.code,
      ResponseType.restorePost.message,
    );
  }

  /**
   * @description 게시물 상세보기 API
   * - 사용자와 Ip로 게시물 방문 기록을 확인한 후 방문한 적이 없다면 게시물의 조회수를 +1 합니다.
   * - 해당 게시물에 댓글 리스트를 가져오고, 게시물과 댓글 리스트를 리턴합니다.
  */
  @AllowAny()
  @ApiOperation({ summary: '게시물 상세 ', description: '게시물 상세보기 API '})
  @ApiOkResponse({ description: ResponseType.getPost.message, type: PostDetailResponseData })
  @Get('/:postId')
  async getOne(
    @Param('postId', ParseIntPipe) postId: number,
    @GetUser() user: User,
    @Ip() ipAddress: string,
  ) {
    const isVisited = await this.postViewLogservice.isVisited(postId, user, ipAddress);

    const post = await this.postService.getOne(postId, isVisited);
    const comments = await this.commentService.getCommentsByPost(postId);
    
    await this.postViewLogservice.createOne(user, post, ipAddress);

    return PostResponse.response(
      ResponseType.getPost.code,
      ResponseType.getPost.message,
      { post, comments },
    );
  }


  /**
   * @description 게시물 리스트 API
   * - 
  */
  @AllowAny()
  @ApiOperation({ summary: '게시물 리스트 ', description: '게시물 리스트 API '})
  @ApiOkResponse({ description: ResponseType.getList.message, type: PostListResponseData })
  @ApiQuery({ name: 'sort', enum: SortOption, required: false, description: '정렬 기준', example: 'createdAt' })
  @ApiQuery({ name: 'order', enum: OrderOption, required: false, description: '차순', example: 'DESC' })
  @ApiQuery({ name: 'search', required: false, description: '검색어', example: '서울' })
  @ApiQuery({ name: 'filter', required: false, description: '해시태그 필터링', example: '#서울,#맛집' })
  @ApiQuery({ name: 'page', required: false, description: '페이지', example: 1 })
  @ApiQuery({ name: 'take', required: false, description: '개수', example: 10 })
  @Get()
  async getList(
    @Query('sort') sort: SortOption,
    @Query('order') order: OrderOption,
    @Query('search') search: string,
    @Query('filter') filter: string,
    @Query('page') page: number,
    @Query('take') take: number,
  ) {
    
    const posts = await this.postService.getList({
      sort, order, search, filter, page, take,
    });

    return PostResponse.response(
      ResponseType.getList.code,
      ResponseType.getList.message,
      posts,
    );
  }
}
