import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { PostHashtag } from './post-hashtag.entity';

@Entity()
export class Hashtag {
  @ApiProperty()
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({ description: '내용', example: '#맛집' })
  @Column({ nullable: true, type: 'text' })
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
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  // 해시태그 : 게시물_해시태그 -> 1:n
  @OneToMany(() => PostHashtag, postHashtag => postHashtag.hashtag)
  postHashtags: PostHashtag[];
}
