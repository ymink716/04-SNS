import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorType } from 'src/common/exception/error-type.enum';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(email: string, nickname: string, password: string): Promise<User> {
    const user: User = this.userRepository.create({ email, nickname, password });
    
    try {
      await this.userRepository.save(user);
    
      return user;
    } catch ({ errno, sqlMessage }) {
      if (errno === 1062) {
        if (sqlMessage.includes(email)) {
          throw new HttpException(ErrorType.emailExist.message, ErrorType.emailExist.code);
        } else if (sqlMessage.includes(nickname)) {
          throw new HttpException(ErrorType.emailExist.message, ErrorType.nicknameExist.code);
        }
      } else {
        throw new HttpException(ErrorType.databaseServerError.message, ErrorType.databaseServerError.code);
      }
    }
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.posts', 'posts')
      .where('user.email = :email', { email })
      .getOne();

    if (!user) { 
      throw new HttpException(ErrorType.userNotFound.message, ErrorType.userNotFound.code);
    }

    return user;
  }

  async getUserById(id: number): Promise<User> {
    const user: User = await this.userRepository.findOne({ where: { id }});
    
    if (!user) { 
      throw new HttpException(ErrorType.userNotFound.message, ErrorType.userNotFound.code);
    }

    return user;
  }

  /**
   * @description 발급받은 Refresh Token을 암호화하여 DB에 저장
  */
  async setRefreshToken(refreshToken: string, email: string): Promise<void> {
    const salt = await bcrypt.genSalt();
    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);
    
    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ hashedRefreshToken })
      .where('email = :email', { email })
      .execute();
  }

  /**
   * @description 데이터베이스 조회 후 Refresh Token이 유효한지 확인
  */
  async getUserIfRefreshTokenMatched(refreshToken: string, email: string): Promise<User> {
    const user: User = await this.getUserByEmail(email);
    
    const isRefreshTokenMatched = await bcrypt.compare(refreshToken, user.hashedRefreshToken);

    if (isRefreshTokenMatched) { 
      return user;
    } else {
      throw new HttpException(ErrorType.unauthorized.message, ErrorType.unauthorized.code);
    }
  }

  /**
   * @description 로그아웃 시 Refresh Token 값을 null로 바꿈
  */
  async removeRefreshToken(id: number): Promise<void> {
    await this.userRepository.update(id, {
      hashedRefreshToken: null,
    });
  }
}
