import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserInput } from './dto/createUser.input';
import { UpdateUserInput } from './dto/updateUser.input';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';
import { ErrorType } from 'src/utils/response/error.type';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    return this;
  }

  async findOneById(id: number): Promise<User> {
    return await this.userRepository.findOneBy({ id });
  }

  async findOne(email: string): Promise<User> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async find(take: number, skip: number): Promise<User[]> {
    return await this.userRepository.find({
      take,
      skip,
    });
  }

  async createUser(input: CreateUserInput): Promise<User> {
    const userExistCheck = await this.findOne(input.email);
    if (userExistCheck) throw new BadRequestException(ErrorType.emailAlreadyExists);

    const { email, password, confirmPassword } = input;
    if (password !== confirmPassword) {
      throw new BadRequestException(ErrorType.invalidPassword);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
    });
    await this.userRepository.save(user);
    return user;
  }

  async updateUser(user: User, input: UpdateUserInput): Promise<User> {
    Object.keys(input).forEach(key => {
      user[key] = input[key];
    });

    return await this.userRepository.save(user);
  }
}
