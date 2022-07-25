import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
declare const JwtStrategy_base: new (...args: any[]) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    readonly configService: ConfigService;
    readonly userService: UserService;
    constructor(configService: ConfigService, userService: UserService);
    validate(payload: {
        sub: User['id'];
    }): Promise<User>;
}
export {};
