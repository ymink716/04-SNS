import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { Post } from './entity/post.entity';
import { HashtagService } from './hashtag.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}
  
  async createPost(createPostDto: CreatePostDto, user: User) {
    const { title, content, hashtags } = createPostDto;

    const post: Post = this.postRepository.create({ 
      title, 
      content, 
      hashtagsText: hashtags,
      user,
    });

    await this.postRepository.save(post);

    return post;
  }
}
