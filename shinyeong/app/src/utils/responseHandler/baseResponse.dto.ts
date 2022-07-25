import { ApiProperty } from '@nestjs/swagger';

/**
 * @description base response template 작성
 */
export abstract class BaseResponse {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;
}
