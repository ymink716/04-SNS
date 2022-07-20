import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { Post } from './entities/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly userService: UserService,
  ) {}

  async create({ user, createPostInput }): Promise<Post> {
    const userInfo: User = await this.userService.fetch({ email: user.email });

    if (!userInfo) throw new NotFoundException('유저 정보가 존재하지 않습니다');
    const result = await this.postRepository.save({
      user: userInfo,
      ...createPostInput,
    });
    delete result.user.password;
    return result;
  }
}
