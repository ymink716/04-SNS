import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

import { ApiExcludeController, ApiExcludeEndpoint } from '@nestjs/swagger';

@ApiExcludeController()
@Controller()
export class AppController {
  @Get()
  @ApiExcludeEndpoint()
  sendToSwaggerDocs(@Res() res: Response) {
    res.redirect(302, 'http://localhost:3003/api/docs');
  }
}
