import { User } from 'src/user/user.entity';
import { AuthService } from './auth.service';
export declare class AuthController {
    readonly authService: AuthService;
    constructor(authService: AuthService);
    refreshToken(user: User): Promise<string>;
}
