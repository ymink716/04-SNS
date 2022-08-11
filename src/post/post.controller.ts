import { Body, Controller, Delete, Get, Ip, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { User } from 'src/user/entity/user.entity';
import { AllowAny } from 'src/common/custom-decorator/allow-any.decorator'; 
import { GetUser } from 'src/common/custom-decorator/get-user.decorator'; 
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostService } from './post.service';
import { GetPostsDto, OrderOption, SortOption } from './dto/get-posts.dto';
import { PostViewLogService } from './post-view-log.service';
import { PostResponse, PostResponseData, PostListResponseData } from './dto/post-response';
import { ResponseType } from 'src/common/response/response-type.enum';

@ApiTags('posts')
@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly postViewLogservice: PostViewLogService,
  ) {}

  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: '게시물 생성 ', description: '게시물 생성 API' })
  @ApiBody({ type: CreatePostDto })
  @ApiCreatedResponse({ description: ResponseType.createPost.message, type: PostResponseData })
  @Post()
  async createPost(@Body() createPostDto: CreatePostDto, @GetUser() user: User) {  
    const post = await this.postService.createPost(createPostDto, user);

    return PostResponse.response(
      ResponseType.createPost.code,
      ResponseType.createPost.message,
      post,
    );
  }

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
    const post = await this.postService.updatePost(postId, updatePostDto, user);

    return PostResponse.response(
      ResponseType.updatePost.code,
      ResponseType.updatePost.message,
      post,
    );
  }

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
   * - 사용자와 Ip로 게시물 방문 기록을 확인한 후 
   * - 방문한 적이 없다면 게시물의 조회수를 +1 합니다.
   * - 해당 게시물에 댓글 리스트를 가져오고, 게시물과 댓글 리스트를 리턴합니다.
  */
  @AllowAny()
  @ApiOperation({ summary: '게시물 상세 ', description: '게시물 상세보기 API '})
  @ApiOkResponse({ description: ResponseType.getPost.message, type: PostResponseData })
  @Get('/:postId')
  async getOne(
    @Param('postId', ParseIntPipe) postId: number,
    @GetUser() user: User,
    @Ip() ipAddress: string,
  ) {
    const isVisited = await this.postViewLogservice.isVisited(postId, user, ipAddress);
    const post = await this.postService.getOne(postId, isVisited);    
    await this.postViewLogservice.createOne(user, post, ipAddress);

    return PostResponse.response(
      ResponseType.getPost.code,
      ResponseType.getPost.message,
      post,
    );
  }

  /**
   * @description 게시물 리스트 API
   * - 해당 조건들로 게시물을 검색하여 게시물 리스트를 리턴합니다.
   * - sort: 정렬 조건 (생성일, 좋아요수, 조회수)
   * - order: 차순 (오름차순, 내림차순)
   * - search: 검색어 (게시물 제목과 내용을 검색합니다.)
   * - filter: 해시태그를 필터링합니다.
   * - page: 검색할 페이지를 설정합니다.
   * - take: 몇 건의 게시물을 가져올지 설정합니다.
   * - 각 조건은 각각, 동시에 적용될 수 있습니다.
  */
  @AllowAny()
  @ApiOperation({ summary: '게시물 리스트 ', description: '게시물 리스트 API '})
  @ApiOkResponse({ description: ResponseType.getList.message, type: PostListResponseData })
  @ApiQuery({ name: 'sort', enum: SortOption, required: false, description: '정렬 기준', example: 'createdAt', allowEmptyValue: true })
  @ApiQuery({ name: 'order', enum: OrderOption, required: false, description: '차순', example: 'DESC', allowEmptyValue: true })
  @ApiQuery({ name: 'search', required: false, description: '검색어', example: '서울', allowEmptyValue: true })
  @ApiQuery({ name: 'filter', required: false, description: '해시태그 필터링', example: '#서울,#맛집', allowEmptyValue: true })
  @ApiQuery({ name: 'page', required: false, description: '페이지', example: 1, allowEmptyValue: true })
  @ApiQuery({ name: 'take', required: false, description: '개수', example: 10, allowEmptyValue: true })
  @Get()
  async getList(@Query() getPostDto: GetPostsDto) {
    const posts = await this.postService.getList(getPostDto);

    return PostResponse.response(
      ResponseType.getList.code,
      ResponseType.getList.message,
      posts,
    );
  }
}
