import { Module } from '@nestjs/common';
import { AppController } from './apis/app/app.controller';
import { AppService } from './apis/app/app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
