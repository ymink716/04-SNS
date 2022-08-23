import { ApiProperty } from '@nestjs/swagger';
import { Post } from 'src/post/entity/post.entity';
import { User } from 'src/user/entity/user.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity()
export class PostViewLog {
  @ApiProperty()
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({ description: '클라이언트 ip' })
  @Column({ nullable: false, type: 'varchar' })
  clientIp: string;

  @ApiProperty({ description: '생성일' })
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  // 접속기록 : 사용자 -> n:1
  @ApiProperty()
  @ManyToOne(() => User, user => user.postViewLogs, { nullable: true })
  user: User;

  // 접속기록 : 게시물 -> n:1
  @ApiProperty()
  @ManyToOne(() => Post, post => post.postViewLogs, { nullable: false })
  post: Post;
}
