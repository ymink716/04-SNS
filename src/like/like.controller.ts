import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { User } from 'src/user/entity/user.entity';
import { GetUser } from 'src/common/custom-decorator/get-user.decorator';
import { LikeDto } from './dto/like.dto';
import { LikeService } from './like.service';
import { PostService } from 'src/post/post.service';
import { ResponseType } from 'src/common/response/response-type.enum';
import { LikeResponse } from './dto/like.response';

@ApiTags('likes')
@UseGuards(JwtAuthGuard)
@Controller('likes')
export class LikeController {
  constructor(
    private readonly likeService: LikeService,
    private readonly postService: PostService,  
  ) {}

  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: '좋아요', description: '해당 게시물에 좋아요를 추가합니다.' })
  @ApiBody({ type: LikeDto })
  @ApiCreatedResponse({ description: ResponseType.createLike.message })
  @Post('/uplike')
  async uplike(@GetUser() user: User, @Body() likeDto: LikeDto) {
    const { postId } = likeDto;

    await this.likeService.uplike(user, postId);
    await this.postService.updateLikeCount(postId, 1);

    return LikeResponse.response(
      ResponseType.createLike.code,
      ResponseType.createLike.message,
    );
  }

  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: '좋아요 취소', description: '해당 게시물에 좋아요를 취소합니다.' })
  @ApiBody({ type: LikeDto })
  @ApiCreatedResponse({ description: ResponseType.deleteLike.message })
  @Post('/unlike')
  async unlike(@GetUser() user: User, @Body() likeDto: LikeDto) {
    const { postId } = likeDto;

    await this.likeService.unlike(user, postId);
    await this.postService.updateLikeCount(postId, -1);

    return LikeResponse.response(
      ResponseType.deleteLike.code,
      ResponseType.deleteLike.message,
    );
  }
}
