import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { ErrorType } from 'src/common/type/error-type.enum';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostsDto, OrderOption, SortOption } from './dto/get-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entity/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}
  
  /**
   * @description 게시물 생성에 관한 비지니스 로직
  */
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

  /**
   * @description 게시물 수정에 관한 비지니스 로직
   * - 인증된 사용자가 해당 게시물의 작성자인지 확인한 뒤 게시물 업데이트
  */
  async updatePost(id: number, updatepostDto: UpdatePostDto, user: User) {    
    const { title, content, hashtags } = updatepostDto;
    
    const post: Post = await this.getPostById(id);
    this.checkAuthor(user, post);

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

  /**
   * @description 게시물 삭제에 관한 비지니스 로직
   * - 인증된 사용자가 해당 게시물의 작성자인지 확인한 뒤 게시물 삭제 (soft delete)
  */
  async deletePost(postId: number, user: User) {
    const post: Post = await this.getPostById(postId);
    this.checkAuthor(user, post);
    await this.postRepository.softDelete({ id: postId });
  }

  /**
   * @description 현재 접속 중인 사용자가 해당 게시물의 작성자인지 확인
  */
  checkAuthor(user: User, post: Post) {
    const isNotAuthor = user.id !== post.user.id;

    if (isNotAuthor) {
      throw new HttpException(ErrorType.postForbidden.message, ErrorType.postForbidden.code);
    }
  }

  /**
   * @description 게시물 복구에 관한 비지니스 로직
   * - 인증된 사용자가 해당 게시물의 작성자인지 확인한 뒤 게시물 복구
  */
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
    const isNotDeletedPost = post.deletedAt === null;
    if (isNotDeletedPost) {
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

  /**
   * @description 게시물 상세보기에 관한 비지니스 로직
   * - 방문한 적이 없는 게시물이라면 조회수 +1 하여 업데이트
  */
  async getOne(postId: number, isVisited: boolean) {
    const post: Post = await this.postRepository.findOne({ 
      where: { id: postId }, 
      relations: ['user', 'comments'] 
    });

    if (!post) {
      throw new HttpException(ErrorType.postNotFound.message, ErrorType.postNotFound.code);
    }
    
    if (isVisited) {
      return post;
    }

    try {
      post.views = post.views + 1;
      const updatedPost = await this.postRepository.save(post);
      
      return updatedPost;
    } catch (error) {
      console.error(error);
      throw new HttpException(ErrorType.serverError.message, ErrorType.serverError.code);
    }
  }

  async getList(GetPostsDto: GetPostsDto) {
    const { search, filter } = GetPostsDto;
    let { sort, order, page, take } = GetPostsDto;

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

  async updateLikeCount(postId: number, n: number) {
    const post: Post = await this.getPostById(postId);
    post.likeCount = post.likeCount + n;

    await this.postRepository.save(post);
  }
}
