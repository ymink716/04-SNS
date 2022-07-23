import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { User } from 'src/user/entity/user.entity';
import { GetUser } from 'src/utils/get-user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Hashtag } from './entity/hashtag.entity';
import { Post as PostEntity } from './entity/post.entity';
import { HashtagService } from './hashtag.service';
import { PostHashtagService } from './post-hashtag.service';
import { PostService } from './post.service';

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly hashtagService: HashtagService,
    private readonly postHashtagService: PostHashtagService,  
  ) {}

  @ApiBearerAuth('access_token')
  @UseGuards(JwtAuthGuard)
  @Post()
  async createPost(@Body() createPostDto: CreatePostDto, @GetUser() user: User) {
    const { hashtags } = createPostDto;
  
    const hashtagList = await this.hashtagService.createHashtagList(hashtags);
    const post = await this.postService.createPost(createPostDto, user);
    await this.postHashtagService.createPostHashtags(hashtagList, post);

    return post;
  }

  @ApiBearerAuth('access_token')
  @UseGuards(JwtAuthGuard)
  @Put('/:postId')
  async updatePost(
    @Body() updatePostDto: UpdatePostDto, 
    @GetUser() user: User,
    @Param('postId', ParseIntPipe) postId: number,) {
    const { hashtags } = updatePostDto;
    
    const hashtagList = await this.hashtagService.createHashtagList(hashtags);
    const post = await this.postService.updatePost(postId, updatePostDto, user);

    await this.postHashtagService.deletePostHashtagByPost(post);
    await this.postHashtagService.createPostHashtags(hashtagList, post);

    return post;
  }

  @Delete('/:postId')
  async deletePost(@Param('postId', ParseIntPipe) postId: number) {
    await this.postService.deletePost(postId);
  }

  @Put('/restore/:postId')
  async restorePost() {
    return
  }

  @Get('/:id')
  async getOne() {
    return
  }

  @Get()
  async getList() {
    return
  }
}
