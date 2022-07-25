import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { Post } from './entity/post.entity';
import { PostService } from './post.service';
export declare class LikeService {
    private readonly postRepository;
    private readonly postService;
    constructor(postRepository: Repository<Post>, postService: PostService);
    likePost(id: number, user: User): Promise<Post>;
    countLikePost(id: number): Promise<Post>;
}
