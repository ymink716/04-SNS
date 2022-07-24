import { Post } from 'src/post/entity/post.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Like } from 'src/like/entity/like.entity';

@Entity()
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({ description: '이메일', example: 'test@mail.com' })
  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @ApiProperty({ description: '닉네임', example: 'tester' })
  @Column({ unique: true })
  nickname: string;

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

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  hashedRefreshToken?: string;

  // 사용자 : 게시물 -> 1:n
  @OneToMany(() => Post, post => post.user)
  posts: Post[];

  // 사용자 : 좋아요 -> 1:n
  @OneToMany(() => Like, like => like.user)
  likes: Like[];
}
