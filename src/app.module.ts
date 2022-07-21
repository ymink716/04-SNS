import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BoardModule } from './board/board.module';
import { LikeModule } from './like/like.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`env/.env`],
    }),
    TypeOrmModule.forRoot({
      type: 'mysql', 
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: ['dist/**/*.entity.{ts,js}'],
      synchronize: true,
      logging: true,
      retryAttempts: 30,
      retryDelay: 5000,
      timezone: 'Z',
    }),
    AuthModule, 
    BoardModule, 
    LikeModule, UserModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
