import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { Article } from './article.entity';

@Entity()
export class ArticleView {
  @ApiProperty()
  @PrimaryGeneratedColumn('increment')
  id: number;

  //   @Column()
  //   @ApiProperty({ description: '사용자 ip 주소' })
  //   ipAddress: ;

  /**
   * @description
   * - article : view = 1:N
   * - user : view = 1:N
   * */
  @ManyToOne(() => Article, (article) => article.articleView, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'articleId', referencedColumnName: 'id' })
  public article: Article;

  //   @ManyToOne(() => User, (user) => user.articleView, {
  //     nullable: false,
  //     onDelete: 'CASCADE',
  //   })
  //   @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  //   public user: User;
}
