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
exports.UpdatePostInput = void 0;
const swagger_1 = require("@nestjs/swagger");
const hashTag_entity_1 = require("../entity/hashTag.entity");
class UpdatePostInput {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: '제목', example: 'title변경', required: false }),
    __metadata("design:type", String)
], UpdatePostInput.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '내용', example: 'content변경', required: false }),
    __metadata("design:type", String)
], UpdatePostInput.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '해시 태그',
        example: [{ tag: '인천' }, { tag: '브런치' }],
        type: [hashTag_entity_1.Hashtags],
        required: false,
    }),
    __metadata("design:type", Array)
], UpdatePostInput.prototype, "tag", void 0);
exports.UpdatePostInput = UpdatePostInput;
//# sourceMappingURL=updatePost.input.js.map