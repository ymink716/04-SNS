import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { User } from 'src/apis/user/entities/user.entity';

@Entity()
export class Feed {
  @ApiProperty({ description: '게시글의 id', example: 1 })
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({ description: '게시글 제목', example: '서울 맛집 추천' })
  @Column('varchar')
  title: string;

  @ApiProperty({
    description: '게시글 내용',
    example: '종로구 부대찌개 맛집 추천드려요!',
  })
  @Column({ type: 'mediumtext' })
  content: string;

  @ApiProperty({
    description: '게시글 해시태그',
    example: '#종로구,#부대찌개,#주말,#맛집',
    nullable: true,
  })
  @Column({ type: 'mediumtext' })
  hashTags: string;

  @ApiProperty({ description: '게시글 조회수', default: 0 })
  @Column({ default: 0 })
  watchCount: number;

  @ApiProperty({ description: '게시글 좋아요수', default: 0 })
  @Column({ default: 0 })
  likeCount: number;

  @ApiPropertyOptional({
    type: Object,
    example: { email: 'test@mail.com' },
    description: '게시글을 작성한 유저 정보',
  })
  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: true })
  user: User;

  @ApiProperty({ description: '게시글이 작성된 시각' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '게시글이 수정된 시각' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: '게시글이 삭제된 시각' })
  @DeleteDateColumn()
  deletedAt: Date;
}
