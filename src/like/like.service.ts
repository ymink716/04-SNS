import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { count } from 'console';
import { Post } from 'src/post/entity/post.entity';
import { PostService } from 'src/post/post.service';
import { User } from 'src/user/entity/user.entity';
import { ErrorType } from 'src/utils/error-type.enum';
import { Repository } from 'typeorm';
import { Like } from './entity/like.entity';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    private readonly postService: PostService,
  ) {}

  async uplike(user: User, postId: number) {
    const post: Post = await this.postService.getPostById(postId);

    this.checkIsAuthor(post, user);

    try {
      const like = this.likeRepository.create({ user, post });
      await this.likeRepository.save(like);

      return like;
    } catch (error) {
      console.error(error);
      throw new HttpException(ErrorType.databaseServerError.message, ErrorType.databaseServerError.code);
    }
  }

  async unlike(user: User, postId: number) {
    const post: Post = await this.postService.getPostById(postId);

    this.checkIsAuthor(post, user);

    try {
      const result = await this.likeRepository.delete({ post, user });

      return result;
    } catch (error) {
      console.error(error);
      throw new HttpException(ErrorType.databaseServerError.message, ErrorType.databaseServerError.code);
    }
  }

  checkIsAuthor(post: Post, user: User) {
    const isAuthor = post.user.id === user.id;

    if (isAuthor) {
      throw new HttpException(ErrorType.likeForbidden.message, ErrorType.likeForbidden.code);
    }
  }

  async getCountsByPost(postId: number) {
    const count = await this.likeRepository.createQueryBuilder()
      .select('like')
      .from(Like, 'like')
      .where('like.postId = :id', { id: postId })
      .getCount();

    return count;
  }
}