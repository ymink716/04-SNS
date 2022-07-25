import { AuthService } from 'src/auth/auth.service';
import { LoginInput } from 'src/auth/dto/login.dto';
import { CreateUserInput } from './dto/createUser.input';
import { UpdateUserInput } from './dto/updateUser.input';
import { User } from './user.entity';
import { UserService } from './user.service';
export declare class UserController {
    readonly userService: UserService;
    readonly authService: AuthService;
    constructor(userService: UserService, authService: AuthService);
    getToken(input: LoginInput): Promise<string>;
    createUser(input: CreateUserInput): Promise<User>;
    user(id: number): Promise<User>;
    users(query: {
        take: number;
        skip: number;
    }): Promise<User[]>;
    updateUser(user: User, input: UpdateUserInput): Promise<User>;
}
