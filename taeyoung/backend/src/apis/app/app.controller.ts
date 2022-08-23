import { Controller, Get, Redirect, Res } from '@nestjs/common';
import { Response } from 'express';

import { ApiExcludeController, ApiExcludeEndpoint } from '@nestjs/swagger';

@ApiExcludeController()
@Controller()
export class AppController {
  @Redirect('http://localhost:3003/api/docs', 302)
  @Get()
  @ApiExcludeEndpoint()
  sendToSwaggerDocs(@Res() res: Response) {
    return 'hello';
  }
}
