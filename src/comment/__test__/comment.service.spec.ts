import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ErrorType } from 'src/common/exception/error-type.enum';
import { Post } from 'src/post/entity/post.entity';
import { PostService } from 'src/post/post.service';
import { User } from 'src/user/entity/user.entity';
import { DeleteResult, Repository } from 'typeorm';
import { CommentService } from '../comment.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { Comment } from '../entity/comment.entity';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const mockCommentRepository = {
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  findOne: jest.fn(), 
};

const mockPostService = {
  getPostById: jest.fn(),
};


describe('CommentService', () => {
  let commentService: CommentService;
  let postService: PostService;
  let commentRepository: MockRepository<Comment>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService, 
        { provide: PostService, useValue: mockPostService },
        { provide: getRepositoryToken(Comment), useValue: mockCommentRepository },
      ],
    }).compile();

    commentService = module.get<CommentService>(CommentService);
    postService = module.get<PostService>(PostService);
    commentRepository = module.get(getRepositoryToken(Comment));
  });

  const user = new User();
  user.id = 1;
  user.email = 'tester@mail.com',
  user.nickname = 'tester';

  const post = new Post();
  post.id = 1;
  post.user = user;

  const comment = new Comment();
  comment.id = 1;
  comment.content = '좋은 게시물이네요 좋아요';
  comment.post = post;
  comment.user = user;

  const commentId = 1;
  const notExistedCommentId = 10;

  const diffUser = new User();
  diffUser.id = 2;

  describe('createComment', () => {
    const createCommentDto: CreateCommentDto = {
      content: '좋은 게시물이네요 좋아요',
      postId: 1,
    };

    const post = new Post();
    post.id = 1;
    post.title = '맛집 추천';
    post.content = '맛집 추천합니다~';

    it('댓글을 생성하고 생성한 댓글을 반환합니다.', async () => {
      jest.spyOn(postService, 'getPostById').mockResolvedValue(post);
      mockCommentRepository.create.mockResolvedValue(comment);
      mockCommentRepository.save.mockResolvedValue(comment);

      const result = await commentService.createComment(createCommentDto, user);
      expect(result).toEqual(comment);
    });
  });

  describe('updateComment', () => {
    const updateCommentDto: UpdateCommentDto = { content: '수정합니다~' };
    const updatedComment = { ...comment, ...updateCommentDto };

    it('해당 댓글을 찾을 수 없다면 예외를 던집니다.', async () => {
      jest.spyOn(commentRepository, 'findOne').mockResolvedValue(undefined);

      const result = async () => {
        await commentService.updateComment(commentId, updateCommentDto, user);
      };

      expect(result).rejects.toThrowError(
        new HttpException(ErrorType.commentNotFound.message, ErrorType.commentNotFound.code)
      );
    });

    it('댓글 작성자와 현재 사용자가 같지 않다면 예외를 던집니다.', async () => {
      jest.spyOn(commentRepository, 'findOne').mockResolvedValue(comment);
      
      const result = async () => {
        await commentService.updateComment(commentId, updateCommentDto, diffUser);
      };

      expect(result).rejects.toThrowError(
        new HttpException(ErrorType.commentForbidden.message, ErrorType.commentForbidden.code)
      );
    });

    it('댓글을 수정하고 수정된 댓글을 반환합니다.', async () => {
      jest.spyOn(commentRepository, 'findOne').mockResolvedValue(comment);
      jest.spyOn(commentRepository, 'save').mockResolvedValue(updatedComment);

      const result = await commentService.updateComment(commentId, updateCommentDto, user);
      
      expect(result.content).toEqual(updateCommentDto.content);
    });
  });

  describe('deleteComment', () => {
    it('해당 댓글을 찾을 수 없다면 예외를 던집니다.', async () => {
      jest.spyOn(commentRepository, 'findOne').mockResolvedValue(undefined);

      const result = async () => {
        await commentService.deleteComment(notExistedCommentId, user);
      };

      expect(result).rejects.toThrowError(
        new HttpException(ErrorType.commentNotFound.message, ErrorType.commentNotFound.code)
      );
    });

    it('댓글 작성자와 현재 사용자가 같지 않다면 예외를 던집니다.', async () => {
      jest.spyOn(commentRepository, 'findOne').mockResolvedValue(comment);
      
      const result = async () => {
        await commentService.deleteComment(commentId, diffUser);
      };

      expect(result).rejects.toThrowError(
        new HttpException(ErrorType.commentForbidden.message, ErrorType.commentForbidden.code)
      );
    });

    it('댓글 작성자와 현재 사용자가 같다면 댓글을 삭제합니다.', async () => {
      jest.spyOn(commentRepository, 'findOne').mockResolvedValue(comment);
      jest.spyOn(commentRepository, 'delete').mockResolvedValue(DeleteResult);

      const result = await commentService.deleteComment(commentId, user);
      
      expect(result).toBeUndefined();
    });
  });
});
