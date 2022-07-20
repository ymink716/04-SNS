import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Post } from 'src/apis/post/entities/post.entity';

@Entity()
export class User {
  @ApiProperty({
    uniqueItems: true,
    description: '유저의 이메일 주소',
    example: 'leo@naver.com',
  })
  @PrimaryColumn({ type: 'varchar', unique: true })
  email: string;

  @ApiProperty({ description: '유저의 비밀번호' })
  @Column()
  password: string;

  @ApiProperty({ description: '유저가 작성한 게시글 목록' })
  @OneToMany(() => Post, (posts) => posts.user, { cascade: true })
  posts: Post[];

  @ApiProperty({ description: '유저 회원정보가 생성된 시각' })
  @CreateDateColumn({})
  createdAt: Date;

  @ApiProperty({ description: '유저 회원정보가 수정된 시각' })
  @UpdateDateColumn()
  updatedAt: Date;
}
