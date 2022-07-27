import { ApiProperty } from '@nestjs/swagger';
import { Post } from 'src/post/entity/post.entity';
import { User } from 'src/user/entity/user.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity()
export class Comment {
  @ApiProperty()
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({ description: '내용', example: '저도 추천!!' })
  @Column({ nullable: false, type: 'varchar' })
  content: string;

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

  // 댓글 : 사용자 -> n:1
  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, user => user.comments, {
    onDelete: 'CASCADE',
    nullable: false
  })
  user: User;

  // 댓글 : 게시물 -> n:1
  @ApiProperty({ type: () => Post })
  @ManyToOne(() => Post, post => post.comments, {
    onDelete: 'CASCADE',
    nullable: false
  })
  post: Post;
}
