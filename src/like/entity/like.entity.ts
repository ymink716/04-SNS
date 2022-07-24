import { ApiProperty } from '@nestjs/swagger';
import { Post } from 'src/post/entity/post.entity';
import { User } from 'src/user/entity/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity()
export class Like {
  @ApiProperty()
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({ description: '생성일' })
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  // 좋아요 : 사용자 -> n:1
  @ApiProperty()
  @ManyToOne(() => User, user => user.likes, {
    onDelete: 'CASCADE',
    nullable: false
  })
  user: User;

  // 좋아요 : 게시물 -> n:1
  @ApiProperty()
  @ManyToOne(() => Post, post => post.likes, {
    onDelete: 'CASCADE',
    nullable: false
  })
  post: Post;
}
