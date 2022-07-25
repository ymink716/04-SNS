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
exports.filterPostDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class filterPostDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: '검색어 (기본 값은 비워서 보냅니다.)', nullable: true, required: false }),
    __metadata("design:type", Array)
], filterPostDto.prototype, "keyword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '해시태그 (기본 값은 비워서 보냅니다.)',
        nullable: true,
        required: false,
    }),
    __metadata("design:type", Array)
], filterPostDto.prototype, "tag", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'DESC(내림차 순)/ASC(오름차 순) 중 선택할 수 있습니다',
        example: 'DESC',
        default: 'DESC',
        nullable: true,
        required: false,
    }),
    __metadata("design:type", String)
], filterPostDto.prototype, "sortedType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, required: false, default: 5 }),
    __metadata("design:type", Number)
], filterPostDto.prototype, "take", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ nullable: true, required: false, default: 0 }),
    __metadata("design:type", Number)
], filterPostDto.prototype, "skip", void 0);
exports.filterPostDto = filterPostDto;
//# sourceMappingURL=filterPost.input.js.map