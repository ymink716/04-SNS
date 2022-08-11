import { Controller, Delete, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { User } from 'src/user/entity/user.entity';
import { GetUser } from 'src/common/custom-decorator/get-user.decorator';
import { LikeService } from './like.service';
import { ResponseType } from 'src/common/response/response-type.enum';
import { LikeResponse } from './dto/like.response';

@ApiTags('likes')
@UseGuards(JwtAuthGuard)
@Controller('likes')
export class LikeController {
  constructor(
    private readonly likeService: LikeService,
  ) {}

  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: '좋아요', description: '해당 게시물에 좋아요를 추가합니다.' })
  @ApiCreatedResponse({ description: ResponseType.createLike.message })
  @Post('/:postId')
  async uplike(@GetUser() user: User, @Param('postId', ParseIntPipe) postId: number) {
    await this.likeService.uplike(user, postId);

    return LikeResponse.response(
      ResponseType.createLike.code,
      ResponseType.createLike.message,
    );
  }

  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: '좋아요 취소', description: '해당 게시물에 좋아요를 취소합니다.' })
  @ApiOkResponse({ description: ResponseType.deleteLike.message })
  @Delete('/:postId')
  async unlike(@GetUser() user: User, @Param('postId', ParseIntPipe) postId: number) {
    await this.likeService.unlike(user, postId);

    return LikeResponse.response(
      ResponseType.deleteLike.code,
      ResponseType.deleteLike.message,
    );
  }
}
