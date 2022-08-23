import { PartialType } from '@nestjs/swagger';
import { CreateFeedInput } from './createFeed.input';

export class UpdateFeedInput extends PartialType(CreateFeedInput) {}
