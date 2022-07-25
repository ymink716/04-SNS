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
exports.PostController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const currenUser_1 = require("../user/decorator/currenUser");
const user_entity_1 = require("..//user/user.entity");
const createPost_input_1 = require("./dto/createPost.input");
const filterPost_input_1 = require("./dto/filterPost.input");
const updatePost_input_1 = require("./dto/updatePost.input");
const like_service_1 = require("./like.service");
const post_service_1 = require("./post.service");
let PostController = class PostController {
    constructor(postService, likeService) {
        this.postService = postService;
        this.likeService = likeService;
    }
    async getPost(id) {
        return this.postService.getOnePost(id);
    }
    async posts(filter) {
        return this.postService.getAllPosts(filter);
    }
    async createPost(user, input) {
        return this.postService.createPost(user, input);
    }
    async updatePost(user, id, input) {
        return this.postService.updatePost(user, id, input);
    }
    async deletePost(user, id) {
        await this.postService.deletePost(user, id);
    }
    async restorePost(id, user) {
        return this.postService.restorePost(id, user);
    }
    async likePost(id, user) {
        return this.likeService.likePost(id, user);
    }
};
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: '게시물 상세 조회 API',
    }),
    (0, swagger_1.ApiBearerAuth)('access_token'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('/:postId'),
    __param(0, (0, common_1.Param)('postId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "getPost", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: '게시물 목록 조회 API',
    }),
    (0, swagger_1.ApiBearerAuth)('access_token'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('/'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filterPost_input_1.filterPostDto]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "posts", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: '게시물 생성 API',
    }),
    (0, swagger_1.ApiBearerAuth)('access_token'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('/'),
    __param(0, (0, currenUser_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, createPost_input_1.CreatePostInput]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "createPost", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: '게시물 수정 API',
    }),
    (0, swagger_1.ApiBearerAuth)('access_token'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Patch)('/:postId'),
    __param(0, (0, currenUser_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('postId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Number, updatePost_input_1.UpdatePostInput]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "updatePost", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: '게시물 삭제 API',
    }),
    (0, swagger_1.ApiBearerAuth)('access_token'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Delete)('/:postId'),
    __param(0, (0, currenUser_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('postId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Number]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "deletePost", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: '삭제된 게시물 복구 API',
    }),
    (0, common_1.Patch)('/:postId/restore'),
    (0, swagger_1.ApiBearerAuth)('access_token'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('postId', common_1.ParseIntPipe)),
    __param(1, (0, currenUser_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "restorePost", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: '좋아요 추가 API',
    }),
    (0, common_1.Post)('/:postId/like'),
    (0, swagger_1.ApiBearerAuth)('access_token'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('postId', common_1.ParseIntPipe)),
    __param(1, (0, currenUser_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], PostController.prototype, "likePost", null);
PostController = __decorate([
    (0, swagger_1.ApiTags)('SNS post'),
    (0, common_1.Controller)('post'),
    __metadata("design:paramtypes", [post_service_1.PostService, like_service_1.LikeService])
], PostController);
exports.PostController = PostController;
//# sourceMappingURL=post.controller.js.map