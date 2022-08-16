import { HttpException, Injectable } from '@nestjs/common';
import { User } from 'src/user/entity/user.entity';
import { ErrorType } from 'src/common/exception/error-type.enum';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { defaultTokenOption } from './token-option.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * @description 새로운 사용자를 생성합니다.
  */
  async register(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, nickname } = createUserDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user: User = await this.userService.createUser(email, nickname, hashedPassword);

    return user;
  }

  /**
   * @description 사용자가 존재하는지 비밀번호가 맞는지 확인합니다.
  */
  async validateUser(payload: LoginUserDto): Promise<User> {
    const { password, email } = payload;

    const user: User = await this.userService.getUserByEmail(email);
    
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      throw new HttpException(ErrorType.passwordDoesNotMatch.message, ErrorType.passwordDoesNotMatch.code);
    }

    return user;
  }

  /**
   * @description acces token과 refresh token을 발급합니다.
  */
  async getTokens(email: string) {
    const { accessToken, accessOption } = await this.getCookieWithAccessToken(email);
    const { refreshToken, refreshOption } = await this.getCookieWithRefreshToken(email);
  
    return { accessToken, accessOption, refreshToken, refreshOption };
  }

  /**
   * @description access token을 발급 받고, 쿠키 정보에 넣어 보내줍니다.
  */
   async getCookieWithAccessToken(email: string) {
    const payload = await this.userService.getUserByEmail(email);
    delete payload.password;

    const accessToken = await this.jwtService.sign(
      { ...payload },
      {
        secret: process.env.JWT_ACCESS_TOKEN_SECRET,
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
      },
    );

    const accessOption = defaultTokenOption;

    return { accessToken, accessOption, ...payload };
  }

  /**
   * @description refresh token을 발급 받고, 쿠키 정보에 넣어 보내줍니다.
  */
  async getCookieWithRefreshToken(email: string) {
    const payload = { email };

    const refreshToken = await this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
    });

    const refreshOption = defaultTokenOption;
    return { refreshToken, refreshOption };
  }

  /**
   * @description 로그아웃 시 쿠키 옵션들을 반환합니다.
  */
  getCookiesForLogOut() {
    const accessOption = { ...defaultTokenOption, maxAge: 0 };
    const refreshOption = { ...defaultTokenOption, maxAge: 0 };
    
    return { accessOption, refreshOption };
  }
}
