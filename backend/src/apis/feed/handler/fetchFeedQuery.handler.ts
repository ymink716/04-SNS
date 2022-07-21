import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { FetchFeedQuery } from 'src/apis/feed/handler/fetchFeed.query';
import { Repository } from 'typeorm';
import { Feed } from '../entities/feed.entity';

@QueryHandler(FetchFeedQuery)
export class FetchFeedQueryHandler implements IQueryHandler<FetchFeedQuery> {
  constructor(
    @InjectRepository(Feed) private readonly feedRepository: Repository<Feed>,
  ) {}

  async execute(query: FetchFeedQuery): Promise<Feed> {
    const { feed } = query;

    if (!feed) throw new NotFoundException('게시글 정보가 존재하지않습니다');

    return await this.feedRepository.save({
      ...feed,
      watchCount: feed.watchCount + 1,
    });
  }
}
