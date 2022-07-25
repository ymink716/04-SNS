import { Repository } from 'typeorm';
import { CreateUserInput } from './dto/createUser.input';
import { UpdateUserInput } from './dto/updateUser.input';
import { User } from './user.entity';
export declare class UserService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    findOneById(id: number): Promise<User>;
    findOne(email: string): Promise<User>;
    find(take: number, skip: number): Promise<User[]>;
    createUser(input: CreateUserInput): Promise<User>;
    updateUser(user: User, input: UpdateUserInput): Promise<User>;
}
