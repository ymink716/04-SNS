import { Body, Controller, Delete, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { User } from 'src/user/entity/user.entity';
import { GetUser } from 'src/utils/get-user.decorator';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@ApiTags('comments')
@Controller('comments')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
  ) {}

  @ApiBearerAuth('access_token')
  @UseGuards(JwtAuthGuard)
  @Post()
  async createComment(@Body() createCommentDto: CreateCommentDto, @GetUser() user: User) {
    const comment = await this.commentService.createComment(createCommentDto, user);

    return comment;
  }

  @ApiBearerAuth('access_token')
  @UseGuards(JwtAuthGuard)
  @Put('/:commentId')
  async updateComment(
    @Param('commentId', ParseIntPipe) commentId: number, 
    @Body() updateCommentDto: UpdateCommentDto, 
    @GetUser() user: User,
  ) {
    const comment = await this.commentService.updateComment(commentId, updateCommentDto, user);

    return comment;
  }

  @ApiBearerAuth('access_token')
  @UseGuards(JwtAuthGuard)
  @Delete('/:commentId')
  async deleteComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @GetUser() user: User,
  ) {
    await this.commentService.deleteComment(commentId, user);
  }

  @ApiBearerAuth('access_token')
  @UseGuards(JwtAuthGuard)
  @Put('/restore/:commentId')
  async restoreComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @GetUser() user: User,
  ) {
    await this.commentService.restoreComment(commentId, user);
  }
}
