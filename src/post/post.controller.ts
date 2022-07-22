import { Body, Controller, Delete, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { Post as PostEntity } from './entity/post.entity';
import { PostService } from './post.service';

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,  
  ) {}

  @ApiBearerAuth('access_token')
  @UseGuards(JwtAuthGuard)
  @Post()
  async createPost(@Body() createPostDto: CreatePostDto) {
    return await this.postService.createPost(createPostDto);
  }

  @Put('/:postId')
  async updatePost() {
    return
  }

  @Delete('/:postId')
  async deletePost() {
    return
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
