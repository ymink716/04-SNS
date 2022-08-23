import { Post } from 'src/post/entity/post.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, instanceToPlain } from 'class-transformer';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Like } from 'src/like/entity/like.entity';
import { Comment } from 'src/comment/entity/comment.entity';
import { PostViewLog } from 'src/post/entity/post-view-log.entity';
import { IsEmail } from 'class-validator';
import { Follow } from './follow.entity';

@Entity()
export class User {
  @ApiProperty({ description: 'User ID', example: 1 })
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({ description: '이메일', example: 'test@mail.com' })
  @IsEmail()
  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @ApiProperty({ description: '닉네임', example: 'tester' })
  @Column({ unique: true })
  nickname: string;

  @ApiProperty({ description: '생성일' })
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @ApiProperty({ description: '수정일' })
  @UpdateDateColumn({
    type: 'timestamp',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  hashedRefreshToken?: string;

  // 사용자 : 게시물 -> 1:n
  @OneToMany(() => Post, post => post.user)
  posts: Post[];

  // 사용자 : 좋아요 -> 1:n
  @OneToMany(() => Like, like => like.user)
  likes: Like[];

  // 사용자 : 댓글 -> 1:n
  @OneToMany(() => Comment, comment => comment.user)
  comments: Comment[];

  // 사용자 : 접속기록 -> 1:n
  @OneToMany(() => PostViewLog, postviewLog => postviewLog.user)
  postViewLogs: PostViewLog[];

  @OneToMany(() => Follow, follow => follow.follower)
  followers: Follow[];

  @OneToMany(() => Follow, follow => follow.following)
  followings: Follow[];

  toJSON() {
    return instanceToPlain(this);
  }
}
