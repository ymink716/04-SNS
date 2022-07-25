import { ApiProperty } from '@nestjs/swagger';
import { Comment } from '../../article/entities/comment.entity';
import { Exclude } from 'class-transformer';
import { Article } from 'src/article/entities/article.entity';
import { Like } from 'src/article/entities/like.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ArticleView } from 'src/article/entities/view.entity';

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

  @ApiProperty({ description: '닉네임', example: '한글nickname123' })
  @Column({ unique: true })
  nickname: string;

  // @ApiProperty({ description: '권한', example: 'USER' })
  // @Column()
  // type: string;

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

  @ApiProperty()
  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  hashedRefreshToken!: 'string';

  @OneToMany(() => Article, (article) => article.user, {
    nullable: true,
    cascade: true,
  })
  @JoinColumn()
  article: Article[];

  @OneToMany(() => Like, (like) => like.user, {
    nullable: true,
    cascade: true,
  })
  @JoinColumn()
  like: Like[];

  // @OneToMany(() => ArticleView, (articleView) => articleView.user, {
  //   nullable: true,
  //   cascade: true,
  // })
  // @JoinColumn()
  // articleView: ArticleView[];

  @OneToMany(() => Comment, (comment) => comment.user, {
    nullable: true,
    cascade: true,
  })
  @JoinColumn()
  comment: Comment[];
}
