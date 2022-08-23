import { Body, Controller, Delete, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { User } from 'src/user/entity/user.entity';
import { GetUser } from 'src/common/custom-decorator/get-user.decorator'; 
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ResponseType } from 'src/common/response/response-type.enum';
import { CommentResponse, CommentResponseData } from './dto/comment-response';

@ApiTags('comments')
@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
  ) {}

  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: '댓글 생성 ', description: '댓글 생성 API' })
  @ApiBody({ type: CreateCommentDto })
  @ApiCreatedResponse({ description: ResponseType.createComment.message, type: CommentResponseData })
  @Post()
  async createComment(@Body() createCommentDto: CreateCommentDto, @GetUser() user: User) {
    const comment = await this.commentService.createComment(createCommentDto, user);
    delete comment.post;

    return CommentResponse.response(
      ResponseType.createComment.code,
      ResponseType.createComment.message,
      comment,
    );
  }

  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: '댓글 수정', description: '댓글 수정 API' })
  @ApiBody({ type: UpdateCommentDto })
  @ApiOkResponse({ description: ResponseType.updateComment.message, type: CommentResponseData })
  @Put('/:commentId')
  async updateComment(
    @Param('commentId', ParseIntPipe) commentId: number, 
    @Body() updateCommentDto: UpdateCommentDto, 
    @GetUser() user: User,
  ) {
    const comment = await this.commentService.updateComment(commentId, updateCommentDto, user);
    delete comment.post;

    return CommentResponse.response(
      ResponseType.updateComment.code,
      ResponseType.updateComment.message,
      comment,
    );
  }

  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: '댓글 삭제', description: '댓글 삭제 API' })
  @ApiOkResponse({ description: ResponseType.deleteComment.message })
  @Delete('/:commentId')
  async deleteComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @GetUser() user: User,
  ) {
    await this.commentService.deleteComment(commentId, user);

    return CommentResponse.response(
      ResponseType.deleteComment.code,
      ResponseType.deleteComment.message,
    );
  }
}
