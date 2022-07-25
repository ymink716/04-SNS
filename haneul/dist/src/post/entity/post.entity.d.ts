import { User } from 'src/user/user.entity';
import { Hashtags } from './hashTag.entity';
export declare class Post {
    id: number;
    title: string;
    content: string;
    likes: number;
    userLikes: User[];
    views: number;
    tags: Hashtags[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    user: User;
    userId: User['id'];
}
