import { Body, Controller, Delete, Get, Ip, Param, ParseIntPipe, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CommentService } from 'src/comment/comment.service';
import { LikeService } from 'src/like/like.service';
import { User } from 'src/user/entity/user.entity';
import { AllowAny } from 'src/utils/allow-any.decorator';
import { GetUser } from 'src/utils/get-user.decorator';
import { IpAddress } from 'src/utils/ip-address.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { HashtagService } from './hashtag.service';
import { PostHashtagService } from './post-hashtag.service';
import { PostService } from './post.service';
import { RealIP } from 'nestjs-real-ip';

@ApiTags('posts')
@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly hashtagService: HashtagService,
    private readonly postHashtagService: PostHashtagService,
    private readonly likeService: LikeService,
    private readonly commentService: CommentService,  
  ) {}

  @ApiBearerAuth('access_token')
  @Post()
  async createPost(@Body() createPostDto: CreatePostDto, @GetUser() user: User) {
    const { hashtags } = createPostDto;
  
    const hashtagList = await this.hashtagService.createHashtagList(hashtags);
    const post = await this.postService.createPost(createPostDto, user);

    await this.postHashtagService.createPostHashtags(hashtagList, post);

    return post;
  }

  @ApiBearerAuth('access_token')
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

    return post;
  }

  @ApiBearerAuth('access_token')
  @Delete('/:postId')
  async deletePost(
    @Param('postId', ParseIntPipe) postId: number,
    @GetUser() user: User,
  ) {
    await this.postService.deletePost(postId, user);
  }

  @ApiBearerAuth('access_token')
  @Put('/restore/:postId')
  async restorePost(
    @Param('postId', ParseIntPipe) postId: number,
    @GetUser() user: User,
  ) {
    await this.postService.restorePost(postId, user);
  }

  @AllowAny()
  @Get('/:postId')
  async getOne(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() req: Request,
    @IpAddress() ipAddress,
  ) {
    const post = await this.postService.getOne(postId, req.user, ipAddress);
    const likes = await this.likeService.getCountsByPost(postId);
    const comments = await this.commentService.getCommentsByPost(postId);
    
    return {post, likes, comments}
  }

  @AllowAny()
  @Get()
  async getList() {
    //const posts = await this.postService.getList();
  }
}
