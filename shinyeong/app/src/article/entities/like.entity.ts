import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Article } from './article.entity';

@Entity()
export class Like {
  @ApiProperty()
  @PrimaryGeneratedColumn('increment')
  public id: number;

  @ApiProperty({ description: '유저 id' })
  @Column()
  public userId: number;

  @ApiProperty({ description: '게시물 id' })
  @Column()
  public articleId: number;

  /**
   * @description
   * - article : like = 1:N
   * - user : like = 1:N
   * */
  @ManyToOne(() => Article, (article) => article.like, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'articleId', referencedColumnName: 'id' })
  public article: Article;

  @ManyToOne(() => User, (user) => user.article, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  public user: User;
}
