import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ErrorType } from 'src/common/exception/error-type.enum';
import { User } from 'src/user/entity/user.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { CreatePostDto } from '../dto/create-post.dto';
import { GetPostsDto, OrderOption, SortOption } from '../dto/get-posts.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { Hashtag } from '../entity/hashtag.entity';
import { Post } from '../entity/post.entity';
import { HashtagService } from '../hashtag.service';
import { PostHashtagService } from '../post-hashtag.service';
import { PostService } from '../post.service';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const mockPostRepository = {
  create: jest.fn(),
  softDelete: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    withDeleted: jest.fn().mockReturnThis(),
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockReturnThis(),
    loadRelationCountAndMap: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockReturnThis(),
  }),
  save: jest.fn(),
  findOne: jest.fn(),
};

const qr = {
  manager: {},
} as QueryRunner;

class MockDataSource {
  createQueryRunner(): QueryRunner {
    return qr;
  }
}

qr.connect = jest.fn();
qr.startTransaction = jest.fn();
qr.commitTransaction = jest.fn();
qr.rollbackTransaction = jest.fn();
qr.release = jest.fn();

const mockHashtagService = {
  createHashtagList: jest.fn(),
};

const mockPostHashtagService = {
  createPostHashtags: jest.fn(),
  deletePostHashtagByPost: jest.fn(),
}

describe('PostService', () => {
  let postService: PostService;
  let postRepository: MockRepository<Post>;
  let hashtagService: HashtagService;
  let postHashtagService: PostHashtagService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        { provide: HashtagService, useValue: mockHashtagService },
        { provide: PostHashtagService, useValue: mockPostHashtagService },
        { provide: getRepositoryToken(Post), useValue: mockPostRepository },
        { provide: DataSource, useClass: MockDataSource },
      ],
    }).compile();

    postService = module.get<PostService>(PostService);
    postRepository = module.get(getRepositoryToken(Post));
    hashtagService = module.get<HashtagService>(HashtagService);
    postHashtagService = module.get<PostHashtagService>(PostHashtagService);
    dataSource = module.get<DataSource>(DataSource);

    Object.assign(qr.manager, { 
      save: jest.fn(), 
      findOne: jest.fn(),
    });
  });

  const author = new User();
  author.id = 1;
  author.email = 'test@mail.com';
  author.nickname = 'tester';

  const user = new User();
  user.id = 2;
  user.email = 'test2@mail.com';
  user.nickname = 'tester2';

  const post = new Post();
  post.id = 1;
  post.title = '서울 맛집 추천해요';
  post.content = '안녕하세요 서울 맛집 추천합니다~';
  post.hashtagsText = '#서울,#맛집';
  post.deletedAt = null;
  post.views = 0;
  post.user = author;

  const hashtagSeoul = new Hashtag();
  hashtagSeoul.id = 1;
  hashtagSeoul.content = '서울';

  const hashtagRestaurant = new Hashtag();
  hashtagRestaurant.id = 2;
  hashtagRestaurant.content = '맛집';

  const hashtagGangNam = new Hashtag();
  hashtagGangNam.id = 3;
  hashtagGangNam.content = '강남';

  const postId = 1;

  const updatedPost = new Post();
  updatedPost.id = 1;
  post.title = '강남 맛집 추천해요';
  post.content = '안녕하세요 강남 맛집 추천합니다~';
  post.hashtagsText = '#강남,#맛집';
  post.deletedAt = null;
  post.views = 1;
  post.user = author;

  const post2 = new Post();
  post2.id = 2;
  post.title = '카페 추천합니다',
  post.content = '안녕하세요 카페 추천합니다~';
  post.hashtagsText = '#카페,#맛집';
  post.deletedAt = null;
  post.views = 0;
  post.user = author;

  describe('createPost', () => {
    const createPostDto: CreatePostDto = {
      title: '서울 맛집 추천해요',
      content: '안녕하세요 서울 맛집 추천합니다~',
      hashtags: '#서울,#맛집',
    };

    let queryRunner;
    it('게시물을 생성하고 반환합니다.', async () => {
      queryRunner = dataSource.createQueryRunner();
      jest.spyOn(postRepository, 'create').mockResolvedValue(post);
      jest.spyOn(queryRunner.manager, 'save').mockResolvedValue(post);
      jest.spyOn(hashtagService, 'createHashtagList').mockResolvedValue([ hashtagSeoul, hashtagRestaurant ]);
      jest.spyOn(postHashtagService, 'createPostHashtags');
      const qrCommitSpy = jest.spyOn(queryRunner, 'commitTransaction');
      const qrRollbackpy = jest.spyOn(queryRunner, 'rollbackTransaction');
      const qrReleaseSpy = jest.spyOn(queryRunner, 'release');

      const result = await postService.createPost(createPostDto, author);

      expect(result).toEqual(post);
      expect(qrCommitSpy).toHaveBeenCalledTimes(1);
      expect(qrRollbackpy).toHaveBeenCalledTimes(0);
      expect(qrReleaseSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('updatePost', () => {
    const updatePostDto: UpdatePostDto = {
      title: '강남 맛집 추천해요',
      content: '안녕하세요 강남 맛집 추천합니다~',
      hashtags: '#강남,#맛집',
    };

    it('게시물을 수정하고 반환합니다.', async () => {
      jest.spyOn(postService, 'getPostById').mockResolvedValue(post);
      const queryRunner = dataSource.createQueryRunner();
      jest.spyOn(queryRunner.manager, 'save').mockResolvedValue(updatedPost);
      jest.spyOn(hashtagService, 'createHashtagList').mockResolvedValue([ hashtagGangNam, hashtagRestaurant ]);
      jest.spyOn(postHashtagService, 'deletePostHashtagByPost');
      jest.spyOn(postHashtagService, 'createPostHashtags');

      const qrCommitSpy = jest.spyOn(queryRunner, 'commitTransaction');
      const qrRollbackpy = jest.spyOn(queryRunner, 'rollbackTransaction');
      const qrReleaseSpy = jest.spyOn(queryRunner, 'release');
      const result = await postService.updatePost(postId, updatePostDto, author);

      expect(result).toEqual(updatedPost);
      expect(qrCommitSpy).toHaveBeenCalled();
      expect(qrRollbackpy).toBeCalledTimes(0);
      expect(qrReleaseSpy).toHaveBeenCalled();
    });

    it('게시물 작성자가 아니라면 예외를 던집니다.', async () => {
      jest.spyOn(postService, 'getPostById').mockResolvedValue(post);

      const result = async () => {
        await postService.updatePost(postId, updatePostDto, user);
      }

      expect(result).rejects.toThrowError(
        new HttpException(ErrorType.postForbidden.message, ErrorType.postForbidden.code)
      );
    });
  });

  describe('deletePost', () => {
    it('게시물 작성자가 아니라면 예외를 던집니다.', async () => {
      jest.spyOn(postService, 'getPostById').mockResolvedValue(post);

      const result = async () => {
        await postService.deletePost(postId, user);
      }

      expect(result).rejects.toThrowError(
        new HttpException(ErrorType.postForbidden.message, ErrorType.postForbidden.code)
      );
    });

    it('게시물을 삭제합니다. (soft delete)', async () => {
      jest.spyOn(postService, 'getPostById').mockResolvedValue(post);

      const result = await postService.deletePost(postId, author);

      expect(result).toBeUndefined();
      expect(postRepository.softDelete).toBeCalledWith({ id: postId });
    });
  });

  describe('restorePost', () => {
    beforeEach(async () => {
      jest.spyOn(postRepository.createQueryBuilder(), 'withDeleted');
      jest.spyOn(postRepository.createQueryBuilder(), 'innerJoinAndSelect');
      jest.spyOn(postRepository.createQueryBuilder(), 'where');
      jest.spyOn(postRepository.createQueryBuilder(), 'andWhere');
    });

    it('게시물이 없거나 작성자가 아닌 경우 예외를 던집니다.', async () => {
      jest.spyOn(postRepository.createQueryBuilder(), 'getOne').mockResolvedValue(undefined);

      const result = async () => {
        await postService.restorePost(postId, user);
      }

      expect(result).rejects.toThrowError(
        new HttpException(ErrorType.postNotFound.message, ErrorType.postNotFound.code)
      );
    });

    it('삭제되지 않은 게시물일 경우 예외를 던집니다.', async () => {
      jest.spyOn(postRepository.createQueryBuilder(), 'getOne').mockResolvedValue(post);

      const result = async () => {
        await postService.restorePost(postId, author);
      }

      expect(result).rejects.toThrowError(
        new HttpException(ErrorType.postNotDeleted.message, ErrorType.postNotDeleted.code)
      );
    });

    it('게시물 복구에 성공합니다.', async () => {
      post.deletedAt = new Date();
      jest.spyOn(postRepository.createQueryBuilder(), 'getOne').mockResolvedValue(post);

      const result = await postService.restorePost(postId, author);
      
      expect(result).toBeUndefined();
    });
  });

  describe('getOne', () => {
    beforeEach(async () => {
      jest.spyOn(postRepository.createQueryBuilder(), 'loadRelationCountAndMap');
      jest.spyOn(postRepository.createQueryBuilder(), 'leftJoinAndSelect');
      jest.spyOn(postRepository.createQueryBuilder(), 'leftJoin');
      jest.spyOn(postRepository.createQueryBuilder(), 'addSelect');
      jest.spyOn(postRepository.createQueryBuilder(), 'where');
    });

    it('해당 게시물을 찾을 수 없다면 예외를 던집니다.', async () => {
      jest.spyOn(postRepository.createQueryBuilder(), 'getOne').mockResolvedValueOnce(undefined);

      const result = async () => {
        await postService.getOne(postId, false);
      };
      
      expect(result).rejects.toThrowError(
        new HttpException(ErrorType.postNotFound.message, ErrorType.postNotFound.code)
      );
      expect(postRepository.createQueryBuilder().loadRelationCountAndMap).toHaveBeenCalled()
      expect(postRepository.createQueryBuilder().leftJoinAndSelect).toHaveBeenCalled()
      expect(postRepository.createQueryBuilder().leftJoin).toHaveBeenCalled()
      expect(postRepository.createQueryBuilder().addSelect).toHaveBeenCalled()
      expect(postRepository.createQueryBuilder().where).toHaveBeenCalled()
      expect(postRepository.createQueryBuilder().getOne).toHaveBeenCalled();
    });

    it('해당 유저의 방문 기록이 있다면 그대로 반환합니다.', async () => {
      jest.spyOn(postRepository.createQueryBuilder(), 'getOne').mockResolvedValue(post);
      
      const result = await postService.getOne(postId, true);

      expect(result).toEqual(post);
    });

    it('해당 유저의 방문 기록이 있는 게시물이라면 게시물의 views를 업데이트하고 반환합니다.', async () => {
      jest.spyOn(postRepository.createQueryBuilder(), 'getOne').mockResolvedValueOnce(post);
      jest.spyOn(postRepository, 'save').mockResolvedValue(updatedPost);
      
      const result = await postService.getOne(postId, false);

      expect(result).toEqual(updatedPost);
      expect(postRepository.save).toHaveBeenCalled();
    });
  });

  describe('getList', () => {
    beforeEach(async () => {
      jest.spyOn(postRepository.createQueryBuilder(), 'select');
      jest.spyOn(postRepository.createQueryBuilder(), 'leftJoin');
      jest.spyOn(postRepository.createQueryBuilder(), 'addSelect');
      jest.spyOn(postRepository.createQueryBuilder(), 'loadRelationCountAndMap');
      jest.spyOn(postRepository.createQueryBuilder(), 'andWhere');
      jest.spyOn(postRepository.createQueryBuilder(), 'orWhere');
      jest.spyOn(postRepository.createQueryBuilder(), 'take');
      jest.spyOn(postRepository.createQueryBuilder(), 'skip');
    });

    it('조건에 맞는 게시물을 반환합니다.', async () => {
      const getPostDto: GetPostsDto = {
        search: '추천',
        filter: '맛집',
        sort: SortOption.CREATEDAT,
        order: OrderOption.DESC,
        page: 1,
        take: 10,
      };

      jest.spyOn(postRepository.createQueryBuilder(), 'getMany').mockResolvedValue([post, post2]);
      
      const result = await postService.getList(getPostDto);

      expect(result.length).toBe(2);
      expect(postRepository.createQueryBuilder().select).toHaveBeenCalled();
      expect(postRepository.createQueryBuilder().leftJoin).toHaveBeenCalled();
      expect(postRepository.createQueryBuilder().addSelect).toHaveBeenCalled();
      expect(postRepository.createQueryBuilder().loadRelationCountAndMap).toHaveBeenCalled();
      expect(postRepository.createQueryBuilder().andWhere).toHaveBeenCalled();
      expect(postRepository.createQueryBuilder().orWhere).toHaveBeenCalled();
      expect(postRepository.createQueryBuilder().orderBy).toHaveBeenCalled();
      expect(postRepository.createQueryBuilder().take).toHaveBeenCalled();
      expect(postRepository.createQueryBuilder().skip).toHaveBeenCalled();
      expect(postRepository.createQueryBuilder().getMany).toHaveBeenCalled();
    });
  });

  describe('getPostById', () => {
    it('게시물이 존재하지 않는다면 예외를 던집니다.', async () => {
      jest.spyOn(postRepository, 'findOne').mockResolvedValue(undefined);

      const result = async () => {
        await postService.getPostById(postId);
      };
      
      expect(result).rejects.toThrowError(
        new HttpException(ErrorType.postNotFound.message, ErrorType.postNotFound.code)
      );
    });

    it('해당 아이디로 게시물을 찾아 반환합니다.', async () => {
      jest.spyOn(postRepository, 'findOne').mockResolvedValue(post);

      const result = await postService.getPostById(postId);

      expect(result).toEqual(post);
      expect(postRepository.findOne).toBeCalled();
    });
  })
});
