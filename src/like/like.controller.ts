import { Body, Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { User } from 'src/user/entity/user.entity';
import { GetUser } from 'src/utils/get-user.decorator';
import { LikeDto } from './dto/like.dto';
import { LikeService } from './like.service';

@ApiTags('like')
@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @ApiBearerAuth('access_token')
  @UseGuards(JwtAuthGuard)
  @Post('/uplike')
  async uplike(@GetUser() user: User, @Body() likeDto: LikeDto) {
    const { postId } = likeDto;

    const result = await this.likeService.uplike(user, postId);

    return result;
  }

  @ApiBearerAuth('access_token')
  @UseGuards(JwtAuthGuard)
  @Post('/unlike')
  async unlike(@GetUser() user: User, @Body() likeDto: LikeDto) {
    const { postId } = likeDto;

    const result = await this.likeService.unlike(user, postId);

    return result;
  }
}
