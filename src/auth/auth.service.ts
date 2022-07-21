import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { ErrorType } from 'src/utils/error.enum';
import { Repository } from 'typeorm';
import { SignUpDto } from './dto/signup.dto';
import * as bcrypt from 'bcryptjs';
import { SignInDto } from './dto/signin.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * @description 새로운 사용자를 생성합니다.
  */
  async signUp(signUpDto: SignUpDto): Promise<User> {
    const { email, password, nickname, confirmPassword } = signUpDto;

    const checkPassword = password !== confirmPassword;
    if(!checkPassword) {
      throw new HttpException(
        ErrorType.confirmPasswordDoesNotMatch.message, 
        ErrorType.confirmPasswordDoesNotMatch.code
      );
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user: User = this.userRepository.create({
      email,
      nickname,
      password: hashedPassword,
    });

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

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;
    const user: User = await this.userRepository.findOne({ where: { email }});

    const checkPassword = await bcrypt.compare(password, user.password);

    if (user && checkPassword) {
      const payload = { email };
      const accessToken = await this.jwtService.sign(payload);

      return { accessToken };
    } else {
      throw new HttpException(ErrorType.unAuthorized.message, ErrorType.unAuthorized.code);
    }
  }
}
