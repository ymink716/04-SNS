import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { CreatePostInput } from './dto/createPost.input';
import { filterPostDto } from './dto/filterPost.input';
import { UpdatePostInput } from './dto/updatePost.input';
import { Hashtags } from './entity/hashTag.entity';
import { Post } from './entity/post.entity';
import { LikeService } from './like.service';
export declare class PostService {
    readonly postRepository: Repository<Post>;
    private readonly likeService;
    private tagRepository;
    constructor(postRepository: Repository<Post>, likeService: LikeService, tagRepository: Repository<Hashtags>);
    getOnePost(id: number): Promise<Post>;
    getAllPosts(filter: filterPostDto): Promise<Post[]>;
    createPost(user: User, input: CreatePostInput): Promise<Post>;
    updatePost(user: User, id: number, input: UpdatePostInput): Promise<Post>;
    deletePost(user: User, id: number): Promise<void>;
    restorePost(id: number, user: User): Promise<Post>;
    existPostCheck(user: User, id: number): Promise<Post>;
}
