import { Post } from 'src/post/entity/post.entity';
export declare class User {
    id: number;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    toJSON(): Record<string, any>;
    posts: Post[];
    likePosts: Post[];
}
