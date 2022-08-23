import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Hashtag } from './hashtag.entity';
import { Post } from './post.entity';

@Entity()
export class PostHashtag {
  @ApiProperty()
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({ description: '생성일' })
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  // 게시물_해시태그 : 게시물 -> n:1
  @ManyToOne(() => Post, post => post.postHashtags, {
    onDelete: 'CASCADE',
    nullable: false
  })
  post: Post;

  // 게시물_해시태그 : 해시태그 : -> n:1
  @ManyToOne(() => Hashtag, hashTag => hashTag.postHashtags, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  hashtag: Hashtag;
}
