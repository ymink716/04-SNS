import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorType } from 'src/common/exception/error-type.enum';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { Follow } from './entity/follow.entity';

@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
  ) {}
  
  /**
   * @description 팔로우 관계를 생성
  */
  async follow(follower: User, following: User): Promise<void> {
    const isSameUser = following.id === follower.id;

    if (isSameUser) {
      throw new HttpException(ErrorType.canNotFollowSameUser.message, ErrorType.canNotFollowSameUser.code);
    }

    const existedFollow = await this.followRepository.findOne({
      where: { 
        follower: { id: follower.id },
        following: { id: following.id }, 
    }});
    
    if (existedFollow) {
      throw new HttpException(ErrorType.alreadyFollowed.message, ErrorType.alreadyFollowed.code);
    }

    const follow: Follow = await this.followRepository.create({ follower, following });
      
    await this.followRepository.save(follow);
  }

  /**
   * @description 팔로우 관계를 해제
  */
  async unfollow(follower: User, following: User): Promise<void> {
    const result = await this.followRepository.delete({
      follower: { id: follower.id },
      following: { id: following.id },
    });

    if (result.affected === 0) {
      throw new HttpException(ErrorType.followNotFound.message, ErrorType.followNotFound.code);
    }
  }

  /**
   * @description 유저의 팔로워 목록을 가져옵니다.
  */
  async getFollowers(userId: number): Promise<User[]> {
    const result = await this.followRepository
      .createQueryBuilder('follow')
      .leftJoin('follow.follower', 'follower')
      .leftJoin('follow.following', 'following')
      .addSelect(['follower.id', 'follower.email', 'follower.nickname'])
      .where('following.id = :followingId', { followingId: userId })
      .getMany();

    const followers = result.map(f => f.follower);

    return followers;
  }

  /**
   * @description 유저의 팔로잉 목록을 가져옵니다.
  */
  async getFollowings(userId: number): Promise<User[]> {
    const result = await this.followRepository
      .createQueryBuilder('follow')
      .leftJoin('follow.follower', 'follower')
      .leftJoin('follow.following', 'following')
      .addSelect(['following.id', 'following.email', 'following.nickname'])
      .where('follower.id = :followerId', { followerId: userId })
      .getMany();

    const followings = result.map(f => f.following);

    return followings;
  }
}
