import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { ErrorType } from 'src/utils/error-type.enum';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostsOptions, OrderOption, SortOption } from './dto/get-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entity/post.entity';
import { PostViewLogService } from './post-view-log.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly postViewLogservice: PostViewLogService,
  ) {}
  
  async createPost(createPostDto: CreatePostDto, user: User) {
    const { title, content, hashtags } = createPostDto;
    
    try {
      const post: Post = this.postRepository.create({ 
        title, 
        content, 
        hashtagsText: hashtags,
        user,
      });

      const newPost = await this.postRepository.save(post);

      return newPost;
    } catch (error) {
      console.error(error);
      throw new HttpException(ErrorType.serverError.message, ErrorType.serverError.code);
    }
  }

  async updatePost(id: number, updatepostDto: UpdatePostDto, user: User) {    
    const { title, content, hashtags } = updatepostDto;

    const post: Post = await this.getPostById(id);
    
    if (user.id !== post.user.id) {
      throw new HttpException(ErrorType.postForbidden.message, ErrorType.postForbidden.code);
    }

    try {
      post.title = title;
      post.content = content;
      post.hashtagsText = hashtags;

      const updatedPost = await this.postRepository.save(post);
      return updatedPost;
    } catch (error) {
      console.error(error);
      throw new HttpException(ErrorType.serverError.message, ErrorType.serverError.code);
    }
  }

  async deletePost(postId: number, user: User) {
    const post: Post = await this.getPostById(postId);
    
    if (user.id !== post.user.id) {
      throw new HttpException(ErrorType.postForbidden.message, ErrorType.postForbidden.code);
    }

    await this.postRepository.softDelete({ id: postId });
  }

  async restorePost(postId: number, user: User) {
    const post: Post = await this.postRepository
      .createQueryBuilder('post')
      .withDeleted()
      .innerJoinAndSelect('post.user', 'user')
      .where('user.id = :userId', { userId: user.id })
      .andWhere('post.id = :postId', { postId })
      .getOne();
    
    if (!post) {
      throw new HttpException(ErrorType.postNotFound.message, ErrorType.postNotFound.code);
    }
    if (post.deletedAt === null) {
      throw new HttpException(ErrorType.postNotDeleted.message, ErrorType.postNotDeleted.code);
    }

    try {
      post.deletedAt = null;
      await this.postRepository.save(post);
    } catch (error) {
      console.error(error);
      throw new HttpException(ErrorType.serverError.message, ErrorType.serverError.code);
    }
  }

  async getOne(postId: number, user, ipAddress) {
    const post: Post = await this.getPostById(postId);

    const isVisited = await this.postViewLogservice.isVisited(postId, user, ipAddress);
    await this.postViewLogservice.createOne(user, post, ipAddress);
    
    if (isVisited) {
      return post;
    } else {
      post.views = post.views + 1;
      const updatedPost = await this.postRepository.save(post);
      return updatedPost;
    }
  }

  async getList(getPostsOptions: GetPostsOptions) {
    const { search, filter } = getPostsOptions;
    let { sort, order, page, take } = getPostsOptions

    sort = sort || SortOption.CREATEDAT;
    order = order || OrderOption.DESC;
    page = page || 1;
    take = take || 1;

    const qb = await this.postRepository
      .createQueryBuilder('post')
      .select([
        'post.id',
        'post.title',
        'post.content',
        'post.hashtagText',
        'post.views',
        'post.createdAt',
        'post.updatedAt',
      ])
      .leftJoin('post.user', 'user')
      .addSelect('user.email');

    if (search) {
      qb.andWhere('post.title like :title', { title: `%${search}%` })
        .orWhere('post.content like :content', { content: `%${search}%` });
    }

    if (filter) {
      const regexp = /[^#,]+/g;  // # , 제외하고 검색
      const matchedArray = [ ...filter.matchAll(regexp) ]
      const tags = matchedArray.map(e => e[0]);

      qb.leftJoin('post.postHashtag', 'postHashtag')
        .leftJoin('postHashtag.hashtag', 'hashtag')
        .andWhere('hashtag.content IN (:...content)', { content: tags });
    }

    const posts = await qb.orderBy(`post.${sort}`, order)
      .take(take)
      .skip((page - 1) * take)
      .getMany();

    return posts;
  }

  async getPostById(id: number): Promise<Post> {
    const post: Post = await this.postRepository.findOne({ 
      where: { id }, 
      relations: ['user'] 
    });
    
    if (!post) {
      throw new HttpException(ErrorType.postNotFound.message, ErrorType.postNotFound.code);
    }

    return post;
  }
}
