"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcryptjs_1 = require("bcryptjs");
const user_service_1 = require("../user/user.service");
const error_type_1 = require("../utils/response/error.type");
let AuthService = class AuthService {
    constructor(jwtService, userService) {
        this.jwtService = jwtService;
        this.userService = userService;
        return this;
    }
    async validateUser(email, password) {
        const user = await this.userService.findOne(email);
        if (!user) {
            throw new common_1.NotFoundException(error_type_1.ErrorType.emailAlreadyExists);
        }
        const isPasswordMatched = await (0, bcryptjs_1.compare)(password, user.password);
        if (!isPasswordMatched) {
            throw new common_1.UnauthorizedException(error_type_1.ErrorType.invalidPassword);
        }
        return user;
    }
    async generateToken(user) {
        return this.jwtService.sign({ sub: user.id, email: user.email });
    }
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService, user_service_1.UserService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map