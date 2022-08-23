import { Column, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from './post.entity';

@Entity('hashTags')
export class Hashtags {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Post, posts => posts.tags, {
    cascade:['soft-remove'],
    createForeignKeyConstraints: false,
  })
  posts: Post;

  @Column({ nullable: true })
  tag: string;
}
