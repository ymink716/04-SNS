import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Hashtag } from './entity/hashtag.entity';

@Injectable()
export class HashtagService {
  constructor(
    @InjectRepository(Hashtag)
    private readonly hashtagRepository: Repository<Hashtag>,
  ) {}

  /**
   * @description 해시태그 리스트를 생성합니다.
   * - 텍스트 형태의 해시태그 리스트를 받아 태그만 남겨 hashtag 테이블에 저장
  */
  async createHashtagList(transactionManager: EntityManager, hashtags: string): Promise<Hashtag[]> {
    const tags = this.splitHashtags(hashtags);

    const hashtagList: Hashtag[] = [];
    for (const t of tags) {
      const existedTag = await this.hashtagRepository.findOne({ where: { content: t }});
      if (existedTag) {
        hashtagList.push(existedTag);
      } else {
        const tag = this.hashtagRepository.create({ content: t });
        const newtag = await transactionManager.save(tag);
        hashtagList.push(newtag);
      }
    }

    return hashtagList;
  }

  /**
   * @description 텍스트 형태의 해시태그를 분할합니다.
   * - #서울,#맛집 => ['서울', '맛집']
  */
  splitHashtags(hashtags: string): string[] {
    const regexp = /[^#,]+/g;  // # , 제외하고 검색
    const matchedArray = [ ...hashtags.matchAll(regexp) ]
    const tags = matchedArray.map(e => e[0]);

    return tags;
  }
}
