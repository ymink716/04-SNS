import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { FetchFeedQuery } from 'src/apis/feed/handler/fetchFeed.query';
import { ErrorType } from 'src/common/type/error.type';
import { Repository } from 'typeorm';
import { Feed } from '../entities/feed.entity';

@QueryHandler(FetchFeedQuery)
export class FetchFeedQueryHandler implements IQueryHandler<FetchFeedQuery> {
  constructor(
    @InjectRepository(Feed) private readonly feedRepository: Repository<Feed>,
  ) {}

  async execute(query: FetchFeedQuery): Promise<Feed> {
    // FetchFeedQuery가 쿼리버스를 통해 핸들러를 호출하면 해당 로직이 실행됩니다
    const { feed } = query;

    if (!feed) throw new NotFoundException(ErrorType.feed.notFound.msg);

    return await this.feedRepository.save({
      ...feed,
      watchCount: feed.watchCount + 1,
    });
  }
}
