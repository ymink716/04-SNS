import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: '댓글',
    example: '도움이 많이 되었습니다! 좋은 글 감사합니다',
  })
  @IsString()
  @MaxLength(255)
  @MinLength(1)
  @IsNotEmpty()
  readonly comment: string;
}
