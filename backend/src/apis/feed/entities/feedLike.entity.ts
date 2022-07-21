import { Feed } from 'src/apis/feed/entities/feed.entity';
import { User } from 'src/apis/user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class FeedLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  isLike: boolean;

  @ManyToOne(() => Feed, { onDelete: 'CASCADE' })
  feed: Feed;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;
}
