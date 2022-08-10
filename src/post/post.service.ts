import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { ErrorType } from 'src/common/exception/error-type.enum';
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
    const post: Post = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoin('comments.user', 'commenter')
      .addSelect(['commenter.id', 'commenter.email', 'commenter.nickname'])
      .leftJoin('post.user', 'author')
      .addSelect(['author.id', 'author.email', 'author.nickname'])
      .where('post.id = :postId', { postId })
      .getOne();

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

  /**
   * @description 게시물 검색에 관한 비지니스 로직
   * - 정렬조건, 차순, 페이지, 개수가 없으면 기본값으로 설정
   * - 검색어(search)가 존재한다면 제목과 내용에서 찾음
   * - 해시태그필터링(filter)가 존재한다면 tag를 추출한 후 해시태그 테이블과 조인하여 검색
   * - 정렬(sort, orderBy), 페이징(page, take)처리하여 리턴  
  */
  async getList(getPostsDto: GetPostsDto) {
    const { search, filter } = getPostsDto;
    let { sort, order, page, take } = getPostsDto;
    
    sort = sort || SortOption.CREATEDAT;
    order = order || OrderOption.DESC;
    page = page || 1;
    take = take || 10;

    try {
      const qb = await this.postRepository
      .createQueryBuilder('post')
      .select([
        'post.id',
        'post.title',
        'post.content',
        'post.hashtagsText',
        'post.views',
        'post.likeCount',
        'post.createdAt',
        'post.updatedAt',
      ])
      .leftJoin('post.user', 'author')
      .addSelect([
        'author.id',
        'author.email',
        'author.nickname',
      ]);

    if (search) {
      qb.andWhere('post.title like :title', { title: `%${search}%` })
        .orWhere('post.content like :content', { content: `%${search}%` });
    }

    if (filter) {
      const regexp = /[^#,]+/g;  // # , 제외하고 검색
      const matchedArray = [ ...filter.matchAll(regexp) ]
      const tags = matchedArray.map(e => e[0]);
      console.log(tags);
      qb.leftJoin('post.postHashtags', 'postHashtags')
        .leftJoin('postHashtags.hashtag', 'hashtag')
        .andWhere('hashtag.content IN (:...tags)', { tags });
    }

    const posts = await qb.orderBy(`post.${sort}`, order)
      .take(take)
      .skip((page - 1) * take)
      .getMany();

    return posts;
    } catch (error) {
      console.error(error);
      throw new HttpException(ErrorType.serverError.message, ErrorType.serverError.code);
    }
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

  /**
   * @description 게시물에 좋아요를 하거나 취소할 경우 좋아요 수를 업데이트합니다. 
  */
  async updateLikeCount(postId: number, n: number) {
    const post: Post = await this.getPostById(postId);
    post.likeCount = post.likeCount + n;

    await this.postRepository.save(post);
  }
}
