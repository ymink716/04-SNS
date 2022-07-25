import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { ErrorType } from 'src/utils/error-type.enum';
import { Brackets, Repository } from 'typeorm';
import { PostViewLog } from './entity/post-view-log.entity';
import { Post } from './entity/post.entity';

@Injectable()
export class PostViewLogService {
  constructor(
    @InjectRepository(PostViewLog)
    private readonly postViewLogRepository: Repository<PostViewLog>,
  ) {}
  
  async createOne(user: User, post: Post, clientIp: string): Promise<void> {
    const log: PostViewLog = await this.postViewLogRepository.create({
      user, post, clientIp
    });

    await this.postViewLogRepository.save(log);
  }

  async isVisited(postId: number, user: User, clientIp: string): Promise<boolean> {
    const log = await this.postViewLogRepository
      .createQueryBuilder('postViewLog')
      .innerJoinAndSelect('postViewLog.post', 'post')
      .where('post.id = :postId', { postId })
      .andWhere(new Brackets(qb => {
        qb.where('postViewLog.userId = :userId', { userId: user.id })
        .orWhere('postViewLog.clientIp = :clientIp', { clientIp })
      }))
      .getOne();
    
    if (log) {
      return true;
    }
    return false;
  }
}
