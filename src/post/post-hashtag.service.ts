import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Hashtag } from './entity/hashtag.entity';
import { PostHashtag } from './entity/post-hashtag.entity';
import { Post } from './entity/post.entity';

@Injectable()
export class PostHashtagService {
  constructor(
    @InjectRepository(PostHashtag)
    private readonly postHashtagRepository: Repository<PostHashtag>,
  ) {}

  /**
   * @description 게시물-해시태그 관계 설정
   * - 해시태그 리스트와 해당 게시물을 받아 관계를 생성합니다.
  */
  async createPostHashtags(transactionManager: EntityManager, hashtagList: Hashtag[], post: Post) {
    for (const hashtag of hashtagList) {
      const postHashtag = this.postHashtagRepository.create({
        hashtag,
        post,
      });
      
      await transactionManager.save(postHashtag);
    }
  }

  /**
   * @description 게시물-해시태그 관계 해제
   * - 게시물에 해당하는 해시태그 관계를 해제합니다.
  */
  async deletePostHashtagByPost(transactionManager: EntityManager, post: Post) {
    const result = await transactionManager
      .createQueryBuilder()
      .select('postHashtag')
      .from(PostHashtag, 'postHashtag')
      .innerJoinAndSelect('postHashtag.post', 'post')
      .where('post.id = :postId', { postId: post.id })
      .delete()
      .execute();
  }
}
