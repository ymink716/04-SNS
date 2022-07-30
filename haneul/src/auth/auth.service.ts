import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { ErrorType } from 'src/utils/response/error.type';

@Injectable()
export class AuthService {
  constructor(readonly jwtService: JwtService, readonly userService: UserService) {
    return this;
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findOne(email);
    if (!user) {
      throw new NotFoundException(ErrorType.emailAlreadyExists);
    }
    const isPasswordMatched = await compare(password, user.password);
    if (!isPasswordMatched) {
      throw new UnauthorizedException(ErrorType.invalidPassword);
    }
    return user;
  }

  async generateToken(user: User): Promise<string> {
    return this.jwtService.sign({ sub: user.id, email: user.email });
  }
}
