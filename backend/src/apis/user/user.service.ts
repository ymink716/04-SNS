import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async fetch({ email }) {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async signup({ createUserInput }): Promise<User> {
    const { email, password, passwordConfirm } = createUserInput;
    const isExist = await this.fetch({ email });
    if (isExist)
      throw new UnprocessableEntityException('이미 가입된 이메일 입니다');

    const isSame = password === passwordConfirm;
    if (!isSame) throw new BadRequestException('비밀번호가 일치하지 않습니다');

    const user = this.userRepository.create({ email, password });
    const result = await this.userRepository.save(user);
    delete result.password;
    return result;
  }
}
