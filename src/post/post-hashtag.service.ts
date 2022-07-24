import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { Hashtag } from './entity/hashtag.entity';
import { PostHashtag } from './entity/post-hashtag.entity';
import { Post } from './entity/post.entity';

@Injectable()
export class PostHashtagService {
  constructor(
    @InjectRepository(PostHashtag)
    private readonly postHashtagRepository: Repository<PostHashtag>,
  ) {}

  async createPostHashtags(hashtagList: Hashtag[], post: Post) {
    for (const hashtag of hashtagList) {
      const postHashtag = this.postHashtagRepository.create({
        hashtag,
        post,
      });
      
      await this.postHashtagRepository.save(postHashtag);
    }
  }

  async deletePostHashtagByPost(post: Post) {
    const result = await this.postHashtagRepository.delete({ post });
    console.log(result);
  }
}
