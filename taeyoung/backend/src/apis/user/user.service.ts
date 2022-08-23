import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorType } from 'src/common/type/error.type';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async signup({ createUserInput }): Promise<User> {
    const { email, password, passwordConfirm } = createUserInput;
    const isExist = await this.fetch({ email });

    // 해당 이메일로 가입된 유저가 존재할시 Error
    if (isExist) throw new ConflictException(ErrorType.user.emailExist.msg);

    const isSame = password === passwordConfirm;

    // 비밀번호와 확인 비밀번호가 다를시 Error
    if (!isSame)
      throw new BadRequestException(ErrorType.user.passwordDoesNotMatch.msg);

    // 엔티티 내장 BeforeInsert() 로 비밀번호 해싱
    const user = this.userRepository.create({ email, password });
    const result = await this.userRepository.save(user);

    delete result.password;
    return result;
  }

  async fetch({ email }): Promise<User> {
    return await this.userRepository.findOne({
      where: { email },
    });
  }
}
