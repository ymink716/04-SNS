import { IQuery } from '@nestjs/cqrs';
import { Feed } from '../entities/feed.entity';

export class FetchFeedQuery implements IQuery {
  constructor(readonly feed: Feed) {}
}
