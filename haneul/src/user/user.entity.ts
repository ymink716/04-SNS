import { classToPlain, Exclude } from 'class-transformer';
import { Post } from 'src/post/entity/post.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, unique: true })
  email: string;

  @Exclude({ toPlainOnly: true })
  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  toJSON() {
    return classToPlain(this);
  }

  @OneToMany(() => Post, post => post.user, { createForeignKeyConstraints: false })
  posts: Post[];

  @ManyToMany(() => Post, post => post.userLikes, { createForeignKeyConstraints: false })
  likePosts: Post[];
}
