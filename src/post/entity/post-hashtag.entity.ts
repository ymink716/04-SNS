import { ApiProperty } from '@nestjs/swagger';
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

  @ApiProperty({ description: '수정일' })
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  // 게시물_해시태그 : 게시물 -> n:1
  @ManyToOne(type => Post, post => post.postHashtags)
  post: Post;

  // 게시물_해시태그 : 해시태그 : -> n:1
  @ManyToOne(type => Hashtag, hashTag => hashTag.postHashtags)
  hashtag: Hashtag;
}
