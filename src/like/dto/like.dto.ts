import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class LikeDto {
  @ApiProperty({ description: '게시물 ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  readonly postId: number;
}