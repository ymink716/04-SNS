import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Feed } from 'src/apis/feed/entities/feed.entity';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';

@Entity()
export class User {
  @ApiProperty({
    uniqueItems: true,
    description: '유저의 이메일 주소',
    example: 'leo@naver.com',
  })
  @PrimaryColumn({ type: 'varchar', unique: true })
  email: string;

  @ApiProperty({
    description: '유저의 비밀번호',
    writeOnly: true,
    maxLength: 20,
    minLength: 6,
  })
  @Column()
  password: string;

  @ApiProperty({
    description: '유저가 작성한 게시글 목록',
    example: ['Post1', 'Post2', '...'],
  })
  @OneToMany(() => Feed, (feeds) => feeds.user, { cascade: true })
  posts: Feed[];

  @ApiProperty({ description: '유저 회원정보가 생성된 시각' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '유저 회원정보가 수정된 시각' })
  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException('비밀번호 해싱 에러');
    }
  }
}
