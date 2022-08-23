import { ApiProperty } from '@nestjs/swagger';
import { Comment } from 'src/comment/entity/comment.entity';
import { Like } from 'src/like/entity/like.entity';
import { User } from 'src/user/entity/user.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  OneToMany,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { PostHashtag } from './post-hashtag.entity';
import { PostViewLog } from './post-view-log.entity';

@Entity()
export class Post {
  @ApiProperty()
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({ description: '제목', example: '맛집 추천합니다.' })
  @Column({ nullable: false, type: 'varchar' })
  title: string;

  @ApiProperty({ description: '내용', example: '맛집 추천합니다. 여기 정말 맛있어요' })
  @Column({ nullable: true, type: 'text' })
  content: string;

  @ApiProperty({ description: '해시테그', example: '#서울,#맛집' })
  @Column({ nullable: true, type: 'varchar' })
  hashtagsText: string;

  @ApiProperty({ description: '조회수', example: 0 })
  @Column({ type: 'integer', default: 0 })
  views: number;

  @ApiProperty({ description: '생성일' })
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @ApiProperty({ description: '수정일' })
  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  @ApiProperty({ description: '삭제일' })
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  // 게시물 : 사용자 -> n:1
  @ManyToOne(() => User, user => user.posts)
  user: User;

  // 게시물 : 게시물_해시태그 -> 1:n
  @OneToMany(() => PostHashtag, postHashtag => postHashtag.post)
  postHashtags: PostHashtag[];

  // 게시물 : 좋아요 -> 1:n
  @OneToMany(() => Like, like => like.post)
  likes: Like[];

  // 게시물 : 댓글 -> 1:n
  @OneToMany(() => Comment, comment => comment.post)
  comments: Comment[];

  // 게시물 : 접속기록 -> 1:n
  @OneToMany(() => PostViewLog, postviewLog => postviewLog.post)
  postViewLogs: PostViewLog[];
}
