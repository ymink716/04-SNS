import { Exclude } from 'class-transformer';
import { User } from 'src/user/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { Hashtags } from './hashTag.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  content: string;

  // 좋아요 카운트
  @Column({ default: 0, nullable: true })
  likes: number;

  // 좋아요
  @ManyToMany(() => User, users => users.likePosts, {
    eager: true,
    createForeignKeyConstraints: false,
  })
  @JoinTable({
    name: 'userLikes',
    joinColumn: {
      name: 'postId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'uid',
      referencedColumnName: 'id',
    },
  })
  userLikes: User[];

  //조회수
  @Column({ default: 0, nullable: true })
  views: number;

  //해시 태그
  @OneToMany(() => Hashtags, tags => tags.posts, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  tags: Hashtags[];

  // 작성일
  @CreateDateColumn()
  createdAt: Date;

  @Exclude({ toPlainOnly: true })
  @UpdateDateColumn()
  updatedAt: Date;

  @Exclude({ toPlainOnly: true })
  @DeleteDateColumn({ default: null })
  deletedAt: Date;

  @Exclude({ toPlainOnly: true })
  @ManyToOne(() => User, user => user.posts)
  user: User;

  @RelationId((post: Post) => post.user)
  userId: User['id'];
}
