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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const currenUser_1 = require("../user/decorator/currenUser");
const user_entity_1 = require("../user/user.entity");
const error_type_1 = require("../utils/response/error.type");
const typeorm_2 = require("typeorm");
const post_entity_1 = require("./entity/post.entity");
const post_service_1 = require("./post.service");
let LikeService = class LikeService {
    constructor(postRepository, postService) {
        this.postRepository = postRepository;
        this.postService = postService;
    }
    async likePost(id, user) {
        const existPost = await this.postService.getOnePost(id);
        if (existPost.userId == user.id)
            throw new common_1.BadRequestException(error_type_1.ErrorType.postAuthorIsSame);
        existPost.userLikes.filter(likeUsers => {
            if (likeUsers.id == user.id)
                throw new common_1.BadRequestException(error_type_1.ErrorType.userAlreadyLiked);
        });
        existPost.userLikes.push(user);
        await this.postRepository.save(existPost);
        const result = await this.countLikePost(id);
        return result;
    }
    async countLikePost(id) {
        const existPost = await this.postService.getOnePost(id);
        const allLikes = await this.postRepository
            .createQueryBuilder('post')
            .innerJoinAndSelect('post.userLikes', 'Like')
            .select('COUNT(*)', 'likeCounts')
            .where('post.id = :id', { id })
            .getRawOne();
        existPost.likes = Number(allLikes.likeCounts);
        const result = await this.postRepository.save(existPost);
        return result;
    }
};
__decorate([
    __param(1, (0, currenUser_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], LikeService.prototype, "likePost", null);
LikeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(post_entity_1.Post)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        post_service_1.PostService])
], LikeService);
exports.LikeService = LikeService;
//# sourceMappingURL=like.service.js.map