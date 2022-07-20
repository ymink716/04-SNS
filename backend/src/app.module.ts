import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './apis/app/app.controller';
import { AppService } from './apis/app/app.service';
import { AuthModule } from './apis/auth/auth.module';
import { PostModule } from './apis/post/post.module';
import { UserModule } from './apis/user/user.module';

@Module({
  imports: [
    UserModule,
    PostModule,
    AuthModule,
    ConfigModule.forRoot({
      envFilePath: ['env/.env'],
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/apis/**/*.entity.*'],
      synchronize: true,
      logging: true,
      retryAttempts: 30,
      retryDelay: 5000,
      timezone: 'Z',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
