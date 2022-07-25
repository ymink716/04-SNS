import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { ErrorType } from 'src/utils/error-type.enum';
import { GetUser } from 'src/utils/get-user.decorator';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entity/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
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

  async getOne(postId: number, clientIp, postCooike) {
    
    const post: Post = await this.getPostById(postId);

    const visited = postCooike !== undefined;
    

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
