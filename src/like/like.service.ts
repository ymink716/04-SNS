import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/post/entity/post.entity';
import { PostService } from 'src/post/post.service';
import { User } from 'src/user/entity/user.entity';
import { ErrorType } from 'src/common/exception/error-type.enum';
import { Repository } from 'typeorm';
import { Like } from './entity/like.entity';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    private readonly postService: PostService,
  ) {}
  

  /**
   * @description 해당 게시물에 좋아요를 추가하는 비지니스 로직
  */
  async uplike(user: User, postId: number): Promise<void> {
    const post: Post = await this.postService.getPostById(postId);

    this.checkIsAuthor(post, user);

    const like = this.likeRepository.create({ user, post });
    await this.likeRepository.save(like);
  }

  /**
   * @description 해당 게시물에 좋아요를 취소하는 비지니스 로직
  */
  async unlike(user: User, postId: number): Promise<void> {
    const post: Post = await this.postService.getPostById(postId);

    this.checkIsAuthor(post, user);

    await this.likeRepository
      .createQueryBuilder('like')
      .delete()
      .where('postId = :postId', { postId })
      .andWhere('userId = :userId', { userId: user.id })
      .execute();
  }

  /**
   * @description 본인의 게시물에는 좋아요를 누를 수 없도록 함
  */
  checkIsAuthor(post: Post, user: User): void {
    const isAuthor = post.user.id === user.id;

    if (isAuthor) {
      throw new HttpException(ErrorType.likeForbidden.message, ErrorType.likeForbidden.code);
    }
  }
}