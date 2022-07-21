import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { Feed } from './entities/feed.entity';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(Feed)
    private readonly feedRepository: Repository<Feed>,
    private readonly userService: UserService,
  ) {}

  async create({ user, createFeedInput }): Promise<Feed> {
    const userInfo: User = await this.userService.fetch({ email: user.email });

    if (!userInfo) throw new NotFoundException('유저 정보가 존재하지 않습니다');
    const result = await this.feedRepository.save({
      user: userInfo,
      ...createFeedInput,
    });
    delete result.user.password;
    return result;
  }

  async update({ feedId, user, updateFeedInput }) {
    const userInfo: User = await this.userService.fetch({ email: user.email });

    if (!userInfo) throw new NotFoundException('유저 정보가 존재하지 않습니다');

    const feed = await this.feedRepository.findOne({ where: { id: feedId } });

    if (!feed) throw new NotFoundException('존재하지 않는 게시글입니다');

    const result = await this.feedRepository.save({
      ...feed,
      user: userInfo,
      ...updateFeedInput,
    });
    delete result.user.password;
    return result;
  }
  async delete({ feedId }) {
    const feed = await this.feedRepository.findOne({ where: { id: feedId } });

    if (!feed) throw new NotFoundException('존재하지 않는 게시글입니다');
    const result = await this.feedRepository.softDelete({ id: feedId });

    return result.affected ? true : false;
  }
}
