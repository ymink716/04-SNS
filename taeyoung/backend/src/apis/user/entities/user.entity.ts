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
import { ErrorType } from 'src/common/type/error.type';

@Entity()
export class User {
  @ApiProperty({
    uniqueItems: true,
    description: '유저의 이메일 주소',
    example: 'leo@naver.com',
  })
  @PrimaryColumn({ type: 'varchar', unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Feed, (feeds) => feeds.user, { cascade: true })
  posts: Feed[];

  @ApiProperty({ description: '유저 회원정보가 생성된 시각' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '유저 회원정보가 수정된 시각' })
  @UpdateDateColumn()
  updatedAt: Date;

  // 생성(create) 전에 비밀번호 해싱
  @BeforeInsert()
  async hashPassword?() {
    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(ErrorType.user.hashing.msg);
    }
  }
}
