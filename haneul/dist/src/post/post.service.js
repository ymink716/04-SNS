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
exports.PostService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const error_type_1 = require("../utils/response/error.type");
const typeorm_2 = require("typeorm");
const hashTag_entity_1 = require("./entity/hashTag.entity");
const post_entity_1 = require("./entity/post.entity");
const like_service_1 = require("./like.service");
let PostService = class PostService {
    constructor(postRepository, likeService, tagRepository) {
        this.postRepository = postRepository;
        this.likeService = likeService;
        this.tagRepository = tagRepository;
    }
    async getOnePost(id) {
        const existPost = await this.postRepository.findOne({
            where: {
                id: id,
            },
            relations: ['tags', 'userLikes'],
        });
        if (!existPost)
            throw new common_1.NotFoundException(error_type_1.ErrorType.postNotFound);
        existPost.views++;
        const result = await this.postRepository.save(existPost);
        return result;
    }
    async getAllPosts(filter) {
        const allPost = await this.postRepository
            .createQueryBuilder('posts')
            .leftJoinAndSelect('posts.tags', 'tags')
            .take(filter.take)
            .skip(filter.skip);
        if (filter.keyword.length > 0 && filter.tag.length == 0) {
            allPost.andWhere('posts.title LIKE (:searchKey)', {
                searchKey: `%${filter.keyword}%`,
            });
        }
        const hashTag = filter.tag || '';
        if (filter.tag.length > 0 && filter.keyword.length == 0) {
            allPost.andWhere('tags.tag IN (:...hashTag)', { hashTag: [hashTag] });
        }
        if (filter.keyword.length > 0 && filter.keyword.length > 0) {
            allPost.andWhere('posts.title LIKE (:searchKey)', {
                searchKey: `%${filter.keyword}%`,
            });
            allPost.andWhere('tags.tag IN (:...hashTag)', { hashTag: [hashTag] });
        }
        if (filter.sortedType == 'DESC') {
            allPost.orderBy({
                'posts.createdAt': 'DESC',
            });
        }
        if (filter.sortedType == 'ASC') {
            allPost.orderBy({
                'posts.createdAt': 'ASC',
            });
        }
        return await allPost.getMany();
    }
    async createPost(user, input) {
        try {
            const posting = new post_entity_1.Post();
            posting.user = user;
            posting.title = input.title;
            posting.content = input.content;
            const tagList = [];
            input.tag.forEach(async (item) => {
                const hasTags = new hashTag_entity_1.Hashtags();
                hasTags.tag = item.tag;
                tagList.push(hasTags);
            });
            posting.tags = tagList;
            return await this.postRepository.save(posting);
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(error_type_1.ErrorType.serverError);
        }
    }
    async updatePost(user, id, input) {
        await this.existPostCheck(user, id);
        const post = await this.postRepository.createQueryBuilder('posts').where('posts.id = :id', { id }).getOne();
        post.title = input.title;
        post.content = input.content;
        await this.tagRepository.createQueryBuilder().delete().from(hashTag_entity_1.Hashtags).where('posts.id= :id', { id }).execute();
        const tagList = [];
        input.tag.forEach(async (item) => {
            const hasTags = new hashTag_entity_1.Hashtags();
            hasTags.tag = item.tag;
            tagList.push(hasTags);
        });
        post.tags = tagList;
        return await this.postRepository.save(post);
    }
    async deletePost(user, id) {
        await this.existPostCheck(user, id);
        try {
            await this.postRepository.softDelete(id);
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(error_type_1.ErrorType.serverError);
        }
    }
    async restorePost(id, user) {
        const existPost = await this.postRepository
            .createQueryBuilder('post')
            .withDeleted()
            .innerJoinAndSelect('post.tags', 'tags')
            .where('post.id=:id', { id })
            .andWhere('post.user.id=:userId', { userId: user.id })
            .getOne();
        if (!existPost) {
            throw new common_1.NotFoundException(error_type_1.ErrorType.postNotFound);
        }
        if (existPost.deletedAt === null) {
            throw new common_1.BadRequestException(error_type_1.ErrorType.postNotDeleted);
        }
        existPost.deletedAt = null;
        return await this.postRepository.save(existPost);
    }
    async existPostCheck(user, id) {
        const existPost = await this.postRepository
            .createQueryBuilder('post')
            .where('post.id=:id', { id })
            .andWhere('post.user.id=:userId', { userId: user.id })
            .getOne();
        if (!existPost)
            throw new common_1.NotFoundException(error_type_1.ErrorType.postNotFound);
        return existPost;
    }
};
PostService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(post_entity_1.Post)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => like_service_1.LikeService))),
    __param(2, (0, typeorm_1.InjectRepository)(hashTag_entity_1.Hashtags)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        like_service_1.LikeService,
        typeorm_2.Repository])
], PostService);
exports.PostService = PostService;
//# sourceMappingURL=post.service.js.map