import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ArticleHashtag } from './article_hashtag.entity';

@Entity()
export class Hashtag {
  @ApiProperty()
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({
    description: '해시태그',
    example: '일상',
  })
  @Column({
    nullable: false,
    unique: true,
  })
  hashtag: string;
  /**
   * @description
   * - article : hashtag = N:M
   * */
  @OneToMany(() => ArticleHashtag, (articleHashtag) => articleHashtag.hashtag, {
    nullable: true,
    cascade: true,
  })
  @JoinColumn()
  articleHashtag: ArticleHashtag[];
}
