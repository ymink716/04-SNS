import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
export declare class AuthService {
    readonly jwtService: JwtService;
    readonly userService: UserService;
    constructor(jwtService: JwtService, userService: UserService);
    validateUser(email: string, password: string): Promise<User>;
    generateToken(user: User): Promise<string>;
}
