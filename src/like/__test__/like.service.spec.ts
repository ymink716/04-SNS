import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ErrorType } from 'src/common/exception/error-type.enum';
import { Post } from 'src/post/entity/post.entity';
import { PostService } from 'src/post/post.service';
import { User } from 'src/user/entity/user.entity';
import { DeleteResult, Repository } from 'typeorm';
import { Like } from '../entity/like.entity';
import { LikeService } from '../like.service';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const mockLikeRepository = {
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    delete: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    execute: jest.fn().mockReturnThis(),
  }),
};

const mockPostService = {
  getPostById: jest.fn(),
};

describe('LikeService', () => {
  let likeService: LikeService;
  let postService: PostService;
  let likeRepository: MockRepository<Like>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikeService,
        { provide: PostService, useValue: mockPostService },
        { provide: getRepositoryToken(Like), useValue: mockLikeRepository },
      ],
    }).compile();

    likeService = module.get<LikeService>(LikeService);
    postService = module.get<PostService>(PostService);
    likeRepository = module.get(getRepositoryToken(Like));
  });

  const user = new User();
  user.id = 1;
  user.email = 'tester@mail.com',
  user.nickname = 'tester';

  const author = new User();
  author.id = 2;

  const post = new Post();
  post.id = 1;
  post.user = author;

  const postId = 1;

  const like = new Like();
  like.user = user;
  like.post = post;

  describe('uplike', () => {
    it('본인의 게시물에 좋아요 요청을 보낸다면 예외를 던집니다.', async () => {
      jest.spyOn(postService, 'getPostById').mockResolvedValue(post);

      const result = async () => {
        await likeService.uplike(author, postId);
      }

      expect(result).rejects.toThrowError(
        new HttpException(ErrorType.likeForbidden.message, ErrorType.likeForbidden.code)
      );
    });

    it('사용자와 게시물에 좋아요 관계를 추가합니다.', async () => {
      jest.spyOn(postService, 'getPostById').mockResolvedValue(post);
      likeRepository.create.mockResolvedValue(like);
      likeRepository.save.mockResolvedValue(like);

      const result = await likeService.uplike(user, postId);
      expect(result).toBeUndefined();
    });
  });

  describe('unlike', () => {
    it('본인의 게시물에 좋아요 취소 요청을 보낸다면 예외를 던집니다.', async () => {
      jest.spyOn(postService, 'getPostById').mockResolvedValue(post);

      const result = async () => {
        await likeService.unlike(author, postId);
      }

      expect(result).rejects.toThrowError(
        new HttpException(ErrorType.likeForbidden.message, ErrorType.likeForbidden.code)
      );
    });

    it('사용자와 게시물에 좋아요 관계를 삭제합니다.', async () => {
      jest.spyOn(postService, 'getPostById').mockResolvedValue(post);

      jest.spyOn(likeRepository.createQueryBuilder(), 'delete');
      jest.spyOn(likeRepository.createQueryBuilder(), 'where');
      jest.spyOn(likeRepository.createQueryBuilder(), 'andWhere');
      jest.spyOn(likeRepository.createQueryBuilder(), 'execute').mockResolvedValue(DeleteResult);

      const result = await likeService.unlike(user, postId);

      expect(likeRepository.createQueryBuilder().delete).toHaveBeenCalledTimes(1);
      expect(likeRepository.createQueryBuilder().where).toHaveBeenCalledTimes(1);
      expect(likeRepository.createQueryBuilder().andWhere).toHaveBeenCalledTimes(1);
      expect(likeRepository.createQueryBuilder().execute).toHaveBeenCalledTimes(1);
      
      expect(result).toBeUndefined();
    });
  });
});
