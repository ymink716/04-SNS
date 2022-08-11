import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { ErrorType } from 'src/common/exception/error-type.enum';
import { Brackets, Repository } from 'typeorm';
import { PostViewLog } from './entity/post-view-log.entity';
import { Post } from './entity/post.entity';

@Injectable()
export class PostViewLogService {
  constructor(
    @InjectRepository(PostViewLog)
    private readonly postViewLogRepository: Repository<PostViewLog>,
  ) {}
  
  /**
   * @description 사용자와, Ip를 받아 게시물 방문 기록을 생성합니다.
  */
  async createOne(user: User, post: Post, clientIp: string): Promise<void> {
    const log: PostViewLog = await this.postViewLogRepository.create({
      user, post, clientIp
    });
  
    await this.postViewLogRepository.save(log);
  }

  /**
   * @description 게시물 방문 기록을 확인
   * - 해당 사용자와 Ip를 확인하여 방문 기록이 있는지 확인
  */
  async isVisited(postId: number, user: User, clientIp: string): Promise<boolean> {
    let userId = null;
    if (user) {
      userId = user.id;
    }

    const log = await this.postViewLogRepository
      .createQueryBuilder('postViewLog')
      .innerJoinAndSelect('postViewLog.post', 'post')
      .where('post.id = :postId', { postId })
      .andWhere(new Brackets(qb => {
        qb.where('postViewLog.userId = :userId', { userId })
        .orWhere('postViewLog.clientIp = :clientIp', { clientIp })
      }))
      .getOne();
    
    if (log) {
      return true;
    } 
    return false;
  }
}
