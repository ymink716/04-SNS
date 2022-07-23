import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hashtag } from './entity/hashtag.entity';

@Injectable()
export class HashtagService {
  constructor(
    @InjectRepository(Hashtag)
    private readonly hashtagRepository: Repository<Hashtag>,
  ) {}

  async createHashtagList(hashtags: string): Promise<Hashtag[]> {
    const tags = this.splitHashtags(hashtags);

    const hashtagList: Hashtag[] = [];
    for (const t of tags) {
      const existedTag = await this.hashtagRepository.findOne({ where: { content: t }});
      if (existedTag) {
        hashtagList.push(existedTag);
      } else {
        const tag = this.hashtagRepository.create({ content: t });
        const newtag = await this.hashtagRepository.save(tag);
        hashtagList.push(newtag);
      }
    }

    return hashtagList;
  }

  async updateHashtagList(hashtags: string) {
    throw new Error('Method not implemented.');
  }

  splitHashtags(hashtags: string): string[] {
    const regexp = /[^#,]+/g;  // # , 제외하고 검색
    const matchedArray = [ ...hashtags.matchAll(regexp) ]
    const tags = matchedArray.map(e => e[0]);

    return tags;
  }
}
