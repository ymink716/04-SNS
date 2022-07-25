import { User } from '..//user/user.entity';
import { CreatePostInput } from './dto/createPost.input';
import { filterPostDto } from './dto/filterPost.input';
import { UpdatePostInput } from './dto/updatePost.input';
import { Post as PostEntity } from './entity/post.entity';
import { LikeService } from './like.service';
import { PostService } from './post.service';
export declare class PostController {
    readonly postService: PostService;
    readonly likeService: LikeService;
    constructor(postService: PostService, likeService: LikeService);
    getPost(id: number): Promise<PostEntity>;
    posts(filter: filterPostDto): Promise<PostEntity[]>;
    createPost(user: User, input: CreatePostInput): Promise<PostEntity>;
    updatePost(user: User, id: number, input: UpdatePostInput): Promise<PostEntity>;
    deletePost(user: User, id: number): Promise<void>;
    restorePost(id: number, user: User): Promise<PostEntity>;
    likePost(id: number, user: User): Promise<PostEntity>;
}
