import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Column,
} from 'typeorm';
import { Article } from './article.entity';
import { Hashtag } from './hashtag.entity';
/**
 * @description
 * - article : hashtag = N:M
 * - Article와 Hashtag의 join table 입니다.
 * */
@Entity()
export class ArticleHashtag {
  @ApiProperty()
  @PrimaryGeneratedColumn('increment')
  public id: number;

  @ApiProperty({ description: '게시물 id' })
  @Column()
  public articleId: number;

  @ManyToOne(() => Hashtag, (hashtag) => hashtag.articleHashtag, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'hashtagId' })
  public hashtag: Hashtag;

  @ManyToOne(() => Article, (article) => article.articleHashtag, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'articleId' })
  public article: Article;

  /**
   * Join 테이블에 CreatedAt을 생성한 이유는 나중에 트랜드 해시태그 등
   * 기능을 더 확장 시키고 싶을 때 더 유연하게 사용할 수 있을 것 같아서입니다.
   */
  @ApiProperty({ description: '생성일' })
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  public createdAt: Date;
}
